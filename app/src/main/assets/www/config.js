// Whitestep site settings. Edit this file to change contact details and sponsors.
window.WHITESTEP = {
  siteName: "Whitestep",

  // Where agency and advertiser enquiries go.
  // If formEndpoint is set (for example a Formspree URL), forms post there.
  // Otherwise forms open the visitor's email app addressed to contactEmail.
  contactEmail: "hello@example.com",
  formEndpoint: "",

  // Shows a short note above the results while listings come from a test feed
  // rather than from partner agencies. Set to false once agencies supply listings.
  previewNotice: true,

  // Sponsor slots. Each sponsor appears as a clearly labelled "Sponsored" card
  // in the results (one every `sponsorEvery` homes) and in the footer strip.
  // Leave the list empty to show "Advertise here" cards instead.
  sponsorEvery: 9,
  sponsors: [
    // {
    //   name: "Island Mortgage Co.",
    //   category: "Mortgages",
    //   message: "Pre-approval in 48 hours for first-time buyers.",
    //   cta: "Check your rate",
    //   url: "https://example.com",
    //   logo: "sponsors/island-mortgage.png"   // optional, square image
    // }
  ]
};
