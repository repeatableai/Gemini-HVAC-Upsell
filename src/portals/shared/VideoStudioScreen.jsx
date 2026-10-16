import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';

// Video Studio — an admin dictates the videos to be made; the super admin
// (Repeatable) produces them on the 3D movie pipeline in the Video-Production
// project and marks each one ready with its video link.

const STATUS = {
    requested: { label: 'Requested', style: 'bg-gray-200 text-gray-800' },
    in_production: { label: 'In production', style: 'bg-amber-100 text-amber-800' },
    ready: { label: 'Ready', style: 'bg-green-100 text-green-800' },
    changes_needed: { label: 'Changes needed', style: 'bg-red-100 text-red-700' },
};
const LENGTHS = [15, 30, 60, 90, 120];
const ASPECTS = [
    { value: '16:9', label: '16:9 wide (tablet, TV, web)' },
    { value: '9:16', label: '9:16 vertical (phone, social)' },
    { value: '1:1', label: '1:1 square' },
];
const LOOKS = ['3D, maxed out', '3D, boardroom calm', 'Illustrated 2D'];
const MUSIC = ['High-impact cinematic score, 12 LU under the voice', 'Calm, confident bed', 'No music'];
const DEFAULT_VOICE = 'Confident American male narrator (ElevenLabs)';

const slug = (text) => text.toLowerCase().replace(/\[syn\]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'video';

// The hand-off to the Video-Production pipeline: everything its planner needs.
export function buildProductionJob(req, company, service, purposeLabel) {
    const folder = req.production_folder || `Video-Production/02-working/${slug(req.title)}/`;
    return [
        'VIDEO JOB: Upseller Platform to Video-Production',
        `Title: ${req.title}`,
        `Folder: ${folder}`,
        'Route: HyperFrames product-launch-video, three-pass build (planner and audio, one worker per frame, finisher), as askfirst-launch-video.',
        `Company: ${company?.name || req.company_id}   Brand colour: ${company?.brand_color || 'planner decides'}`,
        `Purpose: ${purposeLabel}${service ? ` (plays on the technician's tablet during the offer "${service.name}")` : ''}`,
        `Audience: ${req.purpose === 'customer_offer' ? 'homeowners at the kitchen table' : req.purpose === 'tech_training' ? 'field technicians' : 'owners and operators of home-services businesses'}`,
        `Length target: ${req.length_seconds} s   Aspect: ${req.aspect}   Look: ${req.look}`,
        `Narration: ${req.verbatim ? 'VERBATIM, do not reword' : 'tighten for time, keep every claim'}`,
        `Voice: ${req.voice}`,
        `Music: ${req.music}`,
        `Requested by: ${req.requested_by} on ${new Date(req.created_at).toLocaleDateString('en-US')}`,
        'Floors: no text under 36 px at 1920x1080; no figure, source or statistic beyond the script; deliver an MP4 and a phone version under 28 MB.',
        '',
        '--- user_script.txt ---',
        req.script,
    ].join('\n');
}

const CopyBox = ({ text }) => {
    const ref = useRef(null);
    const [copied, setCopied] = useState('');
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied('Copied');
        } catch {
            ref.current?.select();
            setCopied('Selected: press Cmd+C to copy');
        }
    };
    return (
        <div className="mt-3">
            <textarea ref={ref} readOnly value={text} rows={10} className="w-full text-xs font-mono p-3 rounded-lg bg-gray-50 border border-gray-200" />
            <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={copy} className="px-3 py-1.5 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-700">Copy production job</button>
                {copied && <span className="text-sm text-gray-600">{copied}</span>}
            </div>
        </div>
    );
};

const useDictation = (onText) => {
    const recRef = useRef(null);
    const [listening, setListening] = useState(false);
    const [error, setError] = useState('');
    const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

    const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
    const start = () => {
        setError('');
        if (!Recognition) { setError('Dictation needs Google Chrome. Type or paste the script instead.'); return; }
        try {
            const rec = new Recognition();
            rec.continuous = true;
            rec.interimResults = false;
            rec.lang = 'en-US';
            rec.onresult = (e) => {
                const text = Array.from(e.results).slice(e.resultIndex).filter(r => r.isFinal).map(r => r[0].transcript).join(' ');
                if (text) onText(text.trim());
            };
            rec.onerror = (e) => {
                setError(e.error === 'not-allowed' || e.error === 'service-not-allowed'
                    ? 'The microphone is blocked on this page. Allow it in Chrome, or type the script. (The claude.ai preview always blocks it; the hosted app does not.)'
                    : `Dictation stopped: ${e.error}.`);
                setListening(false);
            };
            rec.onend = () => setListening(false);
            rec.start();
            recRef.current = rec;
            setListening(true);
        } catch {
            setError('Dictation could not start here. Type or paste the script instead.');
        }
    };
    useEffect(() => () => recRef.current?.stop(), []);
    return { listening, error, start, stop };
};

const NewVideoForm = ({ companyId, companies, services, purposes, requestedBy, onCreated, onCancel }) => {
    const [form, setForm] = useState({
        company_id: companyId || companies[0]?.id || '',
        title: '', purpose: 'customer_offer', service_id: '', script: '', verbatim: true,
        length_seconds: 30, aspect: '16:9', look: LOOKS[0], voice: DEFAULT_VOICE, music: MUSIC[0],
    });
    const [saving, setSaving] = useState(false);
    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const dictation = useDictation((text) => setForm(prev => ({ ...prev, script: prev.script ? `${prev.script} ${text}` : text })));
    const canSave = form.title.trim() && form.script.trim() && (form.purpose !== 'customer_offer' || form.service_id);

    const submit = async (e) => {
        e.preventDefault();
        if (!canSave) return;
        dictation.stop();
        setSaving(true);
        const { data } = await api.createVideoRequest({ ...form, length_seconds: Number(form.length_seconds), requested_by: requestedBy });
        setSaving(false);
        onCreated(data);
    };

    const field = 'w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200';
    return (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Dictate a new video</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!companyId && (
                    <div>
                        <label htmlFor="vid_company" className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                        <select id="vid_company" className={field} value={form.company_id} onChange={set('company_id')}>
                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                <div className={companyId ? 'sm:col-span-2' : ''}>
                    <label htmlFor="vid_title" className="block text-sm font-medium text-gray-600 mb-1">Video title *</label>
                    <input id="vid_title" className={field} value={form.title} onChange={set('title')} placeholder="e.g. Why a UV light pays for itself" />
                </div>
                <div>
                    <label htmlFor="vid_purpose" className="block text-sm font-medium text-gray-600 mb-1">What it is for</label>
                    <select id="vid_purpose" className={field} value={form.purpose} onChange={set('purpose')}>
                        {purposes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </div>
                {form.purpose === 'customer_offer' && (
                    <div>
                        <label htmlFor="vid_service" className="block text-sm font-medium text-gray-600 mb-1">Plays during which offer *</label>
                        <select id="vid_service" className={field} value={form.service_id} onChange={set('service_id')}>
                            <option value="">Choose an offer...</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}
            </div>
            <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label htmlFor="vid_script" className="block text-sm font-medium text-gray-600">Script — dictate or type *</label>
                    <button
                        type="button"
                        onClick={dictation.listening ? dictation.stop : dictation.start}
                        className={`px-3 py-1.5 text-sm rounded-lg font-semibold ${dictation.listening ? 'bg-red-600 text-white' : 'bg-[#004B87] text-white hover:bg-blue-800'}`}
                    >
                        {dictation.listening ? '■ Stop dictating' : '● Dictate'}
                    </button>
                </div>
                <textarea id="vid_script" rows={7} className={field} value={form.script} onChange={set('script')} placeholder="Say or type exactly what the narrator should say." />
                {dictation.listening && <p className="text-sm text-red-700 mt-1">Listening… speak the script; each sentence appears as you finish it.</p>}
                {dictation.error && <p className="text-sm text-amber-800 mt-1">{dictation.error}</p>}
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.verbatim} onChange={set('verbatim')} /> Narrate word for word (no rewording)
                </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="vid_length" className="block text-sm font-medium text-gray-600 mb-1">Length</label>
                    <select id="vid_length" className={field} value={form.length_seconds} onChange={set('length_seconds')}>
                        {LENGTHS.map(l => <option key={l} value={l}>{l} seconds</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="vid_aspect" className="block text-sm font-medium text-gray-600 mb-1">Shape</label>
                    <select id="vid_aspect" className={field} value={form.aspect} onChange={set('aspect')}>
                        {ASPECTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="vid_look" className="block text-sm font-medium text-gray-600 mb-1">Look</label>
                    <select id="vid_look" className={field} value={form.look} onChange={set('look')}>
                        {LOOKS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="vid_voice" className="block text-sm font-medium text-gray-600 mb-1">Voice</label>
                    <input id="vid_voice" className={field} value={form.voice} onChange={set('voice')} />
                </div>
                <div>
                    <label htmlFor="vid_music" className="block text-sm font-medium text-gray-600 mb-1">Music</label>
                    <select id="vid_music" className={field} value={form.music} onChange={set('music')}>
                        {MUSIC.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={!canSave || saving} className="px-4 py-2 rounded-lg text-white bg-[#004B87] hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <Loader small={true} /> : 'Send to production'}
                </button>
            </div>
        </form>
    );
};

const ProducerControls = ({ req, onSaved }) => {
    const [status, setStatus] = useState(req.status);
    const [url, setUrl] = useState(req.video_url);
    const [folder, setFolder] = useState(req.production_folder);
    const [saving, setSaving] = useState(false);
    const save = async () => {
        setSaving(true);
        await api.updateVideoRequest(req.id, { status, video_url: url.trim(), production_folder: folder.trim() });
        setSaving(false);
        onSaved();
    };
    const field = 'w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm';
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 items-end">
            <div>
                <label htmlFor={`st_${req.id}`} className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select id={`st_${req.id}`} className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
                    {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor={`url_${req.id}`} className="block text-xs font-medium text-gray-600 mb-1">Finished video link (MP4)</label>
                <input id={`url_${req.id}`} className={field} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/video.mp4" />
            </div>
            <button type="button" onClick={save} disabled={saving || (status === 'ready' && !url.trim())} className="px-3 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm font-semibold">
                {status === 'ready' && !url.trim() ? 'Add the link to mark ready' : saving ? 'Saving…' : 'Save'}
            </button>
            <div className="sm:col-span-4">
                <label htmlFor={`folder_${req.id}`} className="block text-xs font-medium text-gray-600 mb-1">Production folder</label>
                <input id={`folder_${req.id}`} className={field} value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Video-Production/02-working/…" />
            </div>
        </div>
    );
};

export const VideoStudioScreen = ({ mode = 'company', companyId, requestedBy }) => {
    const [requests, setRequests] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [services, setServices] = useState([]);
    const [purposes, setPurposes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [openJob, setOpenJob] = useState(null);
    const [notice, setNotice] = useState('');

    const load = useCallback(async () => {
        const [r, c, s, p] = await Promise.all([
            api.getVideoRequests(mode === 'company' ? companyId : undefined),
            api.getCompanies(), api.getServices(), api.getVideoPurposes(),
        ]);
        setRequests(r.data); setCompanies(c.data); setServices(s.data); setPurposes(p.data);
        setLoading(false);
    }, [mode, companyId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="flex justify-center p-8"><Loader /></div>;

    const purposeLabel = (v) => purposes.find(p => p.value === v)?.label || v;

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{mode === 'producer' ? 'Video production' : 'Videos'}</h1>
                <p className="text-gray-500 mt-1">
                    {mode === 'producer'
                        ? 'Every video an admin has dictated, across all companies. Copy the production job into the 3D movie pipeline, then paste the finished link to put it on the technicians\' tablets.'
                        : 'Dictate the videos you want made. Customer-facing videos play on the technician\'s tablet during the offer they belong to, once they are ready.'}
                </p>
            </div>

            {notice && <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">{notice}</div>}

            {showForm ? (
                <NewVideoForm
                    companyId={mode === 'company' ? companyId : undefined}
                    companies={companies}
                    services={services}
                    purposes={purposes}
                    requestedBy={requestedBy}
                    onCreated={async (r) => { setShowForm(false); setNotice(`"${r.title}" sent to production.`); await load(); }}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <button onClick={() => { setShowForm(true); setNotice(''); }} className="px-4 py-2 rounded-lg text-white bg-[#004B87] hover:bg-blue-800 font-semibold">+ Dictate a new video</button>
            )}

            <div className="space-y-4">
                {requests.length === 0 && <p className="text-gray-500">No videos requested yet.</p>}
                {requests.map(req => {
                    const company = companies.find(c => c.id === req.company_id);
                    const service = services.find(s => s.id === req.service_id);
                    const st = STATUS[req.status] || STATUS.requested;
                    return (
                        <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900">{req.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {mode === 'producer' && <>{company?.name || req.company_id} · </>}
                                        {purposeLabel(req.purpose)}{service ? `: ${service.name}` : ''} · {req.length_seconds} s · {req.aspect} · {req.look}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Requested by {req.requested_by}, {new Date(req.created_at).toLocaleDateString('en-US')}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.style}`}>{st.label}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-3 line-clamp-3 whitespace-pre-line">{req.script}</p>
                            {req.status === 'ready' && req.video_url && (
                                <video src={req.video_url} controls playsInline className="w-full max-w-xl mt-3 rounded-lg bg-black aspect-video" />
                            )}
                            <div className="flex flex-wrap gap-3 mt-3">
                                <button type="button" onClick={() => setOpenJob(openJob === req.id ? null : req.id)} className="text-sm text-blue-700 hover:underline">
                                    {openJob === req.id ? 'Hide production job' : 'Show production job'}
                                </button>
                            </div>
                            {openJob === req.id && <CopyBox text={buildProductionJob(req, company, service, purposeLabel(req.purpose))} />}
                            {mode === 'producer' && <ProducerControls req={req} onSaved={async () => { setNotice(`"${req.title}" updated.`); await load(); }} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
