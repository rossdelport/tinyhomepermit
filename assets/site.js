// Menu, the "Do I need a permit?" checker and the quote form. No libraries.
(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Checker: a small decision tree read from <script type="application/json" data-checker>.
  document.querySelectorAll("[data-checker-root]").forEach(function (root) {
    var data = JSON.parse(document.getElementById(root.getAttribute("data-checker-root")).textContent);
    var body = root.querySelector(".checker-body");
    var bar = root.querySelector(".progress i");
    var path = [];

    function show(id) {
      var node = data.nodes[id];
      path.push(id);
      body.innerHTML = "";
      var box = document.createElement("div");
      box.className = "check-step";
      if (node.result) {
        bar.style.width = "100%";
        box.innerHTML = '<div class="result" role="status"><h4>' + node.title + "</h4>" + node.body +
          (node.cta ? '<a class="btn btn-accent" href="' + node.cta.href + '">' + node.cta.text + ' <span class="arr">&rarr;</span></a>' : "") +
          "</div>";
        var again = document.createElement("button");
        again.className = "check-reset";
        again.type = "button";
        again.textContent = "Start again";
        again.addEventListener("click", function () { path = []; show(data.start); });
        box.appendChild(again);
      } else {
        bar.style.width = Math.min(90, path.length / (data.depth || 4) * 100) + "%";
        var q = document.createElement("p");
        q.className = "q";
        q.textContent = node.q;
        box.appendChild(q);
        if (node.help) {
          var h = document.createElement("p");
          h.className = "hint";
          h.style.cssText = "font-size:14.5px;color:var(--muted);margin-top:-6px";
          h.textContent = node.help;
          box.appendChild(h);
        }
        var opts = document.createElement("div");
        opts.className = "opts";
        node.opts.forEach(function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "opt";
          b.textContent = o.t;
          b.addEventListener("click", function () { show(o.go); });
          opts.appendChild(b);
        });
        box.appendChild(opts);
        if (path.length > 1) {
          var back = document.createElement("button");
          back.className = "check-reset";
          back.type = "button";
          back.textContent = "Back";
          back.addEventListener("click", function () { path.pop(); show(path.pop()); });
          box.appendChild(back);
        }
      }
      body.appendChild(box);
    }
    show(data.start);
  });

  // Quote form: tick the permit(s) named in ?permit= and remember which site sent the visitor.
  var form = document.getElementById("quote-form");
  if (form) {
    var params = new URLSearchParams(location.search);
    (params.get("permit") || "").split(",").forEach(function (p) {
      var box = form.querySelector('input[data-key="' + p.trim() + '"]');
      if (box) box.checked = true;
    });
    var from = params.get("from") || document.referrer.replace(/^https?:\/\//, "").split("/")[0] || "direct";
    form.querySelector('input[name="source"]').value = from;
    var err = form.querySelector(".err");
    form.addEventListener("submit", function (e) {
      var picked = [].map.call(form.querySelectorAll('input[data-key]:checked'), function (i) { return i.value; });
      if (!picked.length) {
        e.preventDefault();
        err.style.display = "block";
        form.querySelector(".tiles").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      form.querySelector('input[name="Permits"]').value = picked.join(", ");
      form.querySelectorAll('input[data-key]').forEach(function (i) { i.removeAttribute("name"); });
      var suburb = (form.querySelector('[name="suburb"]').value || "").trim();
      form.querySelector('input[name="_subject"]').value = "New quote request: " + picked.join(", ") + (suburb ? " (" + suburb + ")" : "");
    });
    form.addEventListener("change", function () { err.style.display = "none"; });
  }
})();
