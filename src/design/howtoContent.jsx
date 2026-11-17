// "How to use this" copy, one set per screen. Five sections, in this order:
// What this is / Why it matters / How to use it / Quick start / Detailed instructions.
// Written to describe only what the app does today (read from the code, 2026-11-17).

export const HOWTO = {
    login: {
        what: <>
            <p>The sign-in page for the ServicePro HVAC demo, built on the Upseller Platform.</p>
            <p>One sign-in opens one of three portals: the technician's tablet app, the company admin's dashboard, or the super admin's console.</p>
        </>,
        why: <>
            <p>Each person sees only the tools for their job. Technicians see the offers to present. Admins see whether the asks happened and what they earned. The super admin sets up companies and produces videos.</p>
        </>,
        how: <>
            <p>Type an email and a password, then press <b>Sign In</b>. Your email decides which portal opens. In the offline demo any password works; on the live version use the password Repeatable gave you.</p>
        </>,
        quick: [
            <>Type <b>tech@demo.com</b> in the Email box.</>,
            <>Type the password (any password works in the offline demo).</>,
            <>Press <b>Sign In</b>.</>,
        ],
        detail: [
            <>Pick who you want to be: <b>tech@demo.com</b> is a technician, <b>admin@demo.com</b> is a company admin, <b>superadmin@demo.com</b> is the super admin.</>,
            <>Type that email in the <b>Email</b> box.</>,
            <>Type anything in the <b>Password</b> box. The demo does not check it.</>,
            <>Press <b>Sign In</b>. The portal for that role opens.</>,
            <>To try another role, log out (top right for technicians and the super admin, bottom of the menu for admins), then sign in with another email.</>,
            <>The moon button at the top right turns on the dark theme. The sun button turns it off. This device remembers your choice.</>,
        ],
    },

    technician: {
        what: <>
            <p>The technician's tablet app. It walks you through each customer visit and records every offer you make and every answer the customer gives.</p>
        </>,
        why: <>
            <p>How many add-on sales slip away only because nobody asked? Here the ask is part of the job: a visit stays open until each required offer has the customer's decision.</p>
            <p>Approved offers become one signed order, so the work and the revenue are on record.</p>
        </>,
        how: <>
            <p>Start a visit, present each required offer, let the customer decide, then close the visit. Anything approved goes into a signed order before the visit closes.</p>
        </>,
        quick: [
            <>Type the customer's name, pick the visit type and press <b>Start visit</b>.</>,
            <>Press <b>Present now</b> next to the first required offer.</>,
            <>Read the script, press <b>Present to Customer</b>, and let the customer press <b>Approve</b> or <b>Decline</b>.</>,
            <>Repeat until each required offer has a decision.</>,
            <>Press <b>Close visit</b>, or <b>Create order and close visit</b> if anything was approved.</>,
        ],
        detail: [
            <><b>Start a visit.</b> Enter the customer name and pick the visit type (both required). The service address is optional. The yellow box lists the required offers for that visit type, up to four. Press <b>Start visit</b>.</>,
            <><b>Read the Current visit panel.</b> It shows how many required offers you have asked, a progress bar, and a <b>Present now</b> button beside each offer still waiting.</>,
            <><b>Present an offer.</b> Press <b>Present now</b>, or tap any service card lower on the page. You see the price, the customer benefits, a video when one is ready, and your script. Press <b>Present to Customer</b>.</>,
            <><b>Let the customer decide.</b> The customer presses <b>Approve</b> or <b>Decline</b>. A decline needs a reason and the customer's initials (two letters or more) before <b>Confirm Decline</b> works.</>,
            <><b>After a decline</b> you can set a 30-day follow-up for the address, or press <b>Skip</b>. Follow-ups go to your admin's Follow-Ups page.</>,
            <><b>Approved offers</b> collect in the green Approved Services box. Press the X beside one to take it out.</>,
            <><b>The close button stays locked</b> and says how many required offers are left. It unlocks once each one has a decision.</>,
            <><b>Make the order.</b> If anything was approved, press <b>Create order and close visit</b>. Fill in the customer's name, email, phone and address. For a service with a price range, set the final price in its box. Pick a payment method, have the customer sign in the signature box, tick the agreement box, and press <b>Submit Binding Order</b>.</>,
            <><b>Finish.</b> The receipt appears. Press <b>Done — Return to Services</b> to close the visit. With nothing approved, <b>Close visit</b> closes it right away.</>,
            <>Log out with the button at the top right.</>,
        ],
    },

    admin: {
        what: <>
            <p>The company admin's control room for your upsell program: results, the service catalog, your technicians, follow-ups, settings, and the videos you want made.</p>
        </>,
        why: <>
            <p>Can you see which technicians ask, and what each ask is worth? The dashboard shows the Ask Rate, the offers made, approvals, declines, and an estimate of the money left on the table, so coaching starts from facts.</p>
        </>,
        how: <>
            <p>Pick a page from the menu on the left. On a phone, press the menu button at the top left first. The Dashboard opens when you sign in.</p>
        </>,
        quick: [
            <>On the <b>Dashboard</b>, read <b>Ask Rate</b>: the share of visits where at least one offer was made.</>,
            <>Change the period with <b>7 Days</b>, <b>30 Days</b>, <b>90 Days</b> or <b>All Time</b>.</>,
            <>Click a technician in the leaderboard to see their results.</>,
            <>Open <b>Videos</b> and press <b>+ Dictate a new video</b> to ask for a video.</>,
        ],
        detail: [
            <><b>Dashboard.</b> The Monthly Revenue Goal bar shows revenue against your goal. Ask Rate, Total Offers, Approved, Declined and Approval Rate sum up the period. <b>Left on the Table</b> estimates the revenue from declined offers. Lower down: revenue by trade, a chart per service, offer outcomes, why customers decline, services often approved together, and the technician leaderboard. Click a sortable column heading to sort; click a row for detail.</>,
            <><b>Services.</b> Every service with its type, price and status. <b>Add Service</b> or <b>Edit</b> opens a form for the name, type, price range, offer context, customer benefits and the technician script. The Active / Paused pill switches a service on or off. The bin button deletes it after you confirm.</>,
            <><b>Technicians.</b> Invite a technician with a name and email. Click a name or <b>View</b> for a 30-day and 90-day profile. The status pill switches a technician between active and inactive. The pencil edits; the bin deletes after you confirm.</>,
            <><b>Follow-Ups.</b> Declined offers that a technician tagged for a follow-up, with Due Now ones first. Press X to dismiss one. Search an address to see each offer made there before.</>,
            <><b>Videos.</b> Press <b>+ Dictate a new video</b>. Give it a title and choose what it is for; a customer video also needs the offer it plays during. Press <b>Dictate</b> and speak the script (Google Chrome), or type it. Choose length, shape, look, voice and music, then press <b>Send to production</b>. When its status reaches Ready, a customer video plays on the technician's tablet during its offer.</>,
            <><b>Settings.</b> Choose where orders go (email, webhook or accounting system), set performance goals and notifications, then press <b>Save All Settings</b>.</>,
            <>Log out from the bottom of the menu.</>,
        ],
    },

    superadmin: {
        what: <>
            <p>The super admin console for the Upseller Platform. It sets up client companies and produces the videos their admins ask for.</p>
        </>,
        why: <>
            <p>New companies start here, and each video an admin dictates lands here for production. The tiles show how many companies, technicians, offers and dollars the platform carries.</p>
        </>,
        how: <>
            <p>Use the two tabs under the top bar: <b>Companies</b> and <b>Video production</b>.</p>
        </>,
        quick: [
            <>On <b>Companies</b>, press <b>+ Add company</b>.</>,
            <>Fill in the company name and the company admin email, then press <b>Create company and invite admin</b>.</>,
            <>Open <b>Video production</b>, press <b>Show production job</b> on a request, then <b>Copy production job</b>.</>,
            <>When the video is finished, paste its link, set the status to <b>Ready</b> and press <b>Save</b>.</>,
        ],
        detail: [
            <><b>Tiles.</b> Companies, active companies, technicians, offers in the last 30 days, and upsell revenue in the last 30 days.</>,
            <><b>Add a company.</b> The name and the admin email are required; website, trade, brand colour and admin name are optional. In this demo no invite email is sent.</>,
            <><b>Pause or Activate</b> in a company's row switches that company off or on.</>,
            <><b>Video production</b> lists the video requests from all companies.</>,
            <><b>Show production job</b> opens the full job text for the 3D movie pipeline in the Video-Production project. <b>Copy production job</b> copies it.</>,
            <><b>After production</b>, paste the finished MP4 link, choose the status (Requested, In production, Ready or Changes needed), add the production folder if you like, and press <b>Save</b>. Ready needs a link.</>,
            <>You can also dictate a request yourself with <b>+ Dictate a new video</b> and pick the company.</>,
            <>Log out with the button at the top right.</>,
        ],
    },
};
