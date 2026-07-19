const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const footer = document.querySelector(".footer");

if (footer && !footer.querySelector(".footer-grid")) {
  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="brand footer-brand" href="index.html">
          <img class="brand-logo" src="assets/ijles-emblem.svg" alt="" width="46" height="46">
          <span><strong>IJLES</strong><small>International Journal of Language, Education and Society</small></span>
        </a>
        <p>Open-access academic journal for research at the intersection of language, education, and society.</p>
      </div>
      <div><h2>Journal</h2><a href="about.html">About</a><a href="aims-scope.html">Aims &amp; Scope</a><a href="editorial.html">Editorial Board</a><a href="call-for-papers.html">Call for Papers</a></div>
      <div><h2>For Authors</h2><a href="authors.html">Author Guidelines</a><a href="contact.html">Submit a Manuscript</a><a href="submission-checklist.html">Submission Checklist</a><a href="fees.html">Publication Fees</a></div>
      <div><h2>Policies</h2><a href="policies.html">Publication Ethics</a><a href="policies.html#peer-review">Peer Review</a><a href="policies.html#open-access">Open Access</a><a href="privacy.html">Privacy Statement</a></div>
      <div><h2>Contact</h2><a href="mailto:ijlescontact@gmail.com">ijlescontact@gmail.com</a><a href="faq.html">FAQ</a><a href="indexing.html">Indexing</a></div>
    </div>
    <div class="container copyright">&copy; <span data-current-year></span> International Journal of Language, Education and Society. All rights reserved.</div>
  `;

  footer.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}
