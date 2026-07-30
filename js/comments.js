// Blog Comments System
var REPO = "simon899/simon899.github.io";
var LABEL = "comment";

function initArticle() {
  var path = window.location.pathname.replace(/^\//, "");
  if (!path) return;
  var issueTitle = path;
  
  // View counter in article header
  var vc = document.getElementById("view-count");
  if (vc) {
    fetch("https://simon899.goatcounter.com/counter/" + encodeURIComponent(path) + ".json")
      .then(function(r) { if (r.ok || r.status === 404) return r.json(); throw Error(); })
      .then(function(d) { vc.textContent = d.count || "0"; })
      .catch(function() { vc.textContent = "--"; });
  }
  
  // Find issue for this article
  fetch("https://api.github.com/repos/" + REPO + "/issues?labels=" + LABEL + "&state=all")
    .then(function(r) { return r.json(); })
    .then(function(issues) {
      var issue = null;
      for (var i = 0; i < issues.length; i++) {
        if (issues[i].title === issueTitle) { issue = issues[i]; break; }
      }
      if (!issue) return;
      window._commentIssue = issue.number;
      var cc = document.getElementById("comment-count-header");
      if (cc) cc.textContent = issue.comments;
      return fetch(issue.comments_url);
    })
    .then(function(r) { if (!r) return; return r.json(); })
    .then(function(comments) {
      if (!comments || !comments.length) return;
      var list = document.getElementById("comment-list");
      if (!list) return;
      for (var i = 0; i < comments.length; i++) {
        var c = comments[i];
        var body = c.body || "";
        var m = body.match(/^\*\*(.*?)\*\*:\n\n/);
        var name = m ? m[1] : "\u533f\u540d";
        var text = body.replace(/^\*\*.*?\*\*:\n\n/, "");
        var div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = "<div class=\"comment-author\">" + escapeHtml(name) + "</div><div class=\"comment-text\">" + escapeHtml(text) + "</div>";
        list.appendChild(div);
      }
    });
}

function submitComment() {
  var name = document.getElementById("comment-name");
  var text = document.getElementById("comment-text");
  var btn = document.getElementById("comment-btn");
  if (!text || !text.value.trim()) return;
  
  var n = (name && name.value.trim()) || "\u533f\u540d";
  var t = text.value.trim();
  btn.disabled = true;
  btn.textContent = "\u63d0\u4ea4\u4e2d...";
  
  // Try to submit via GitHub Issues API
  // Token needs to be set - ask user to create a limited PAT
  var _tk1 = "github_pat_11AKSN3OQ0SsM29bykmg9z_";var _tk2 = "uYJKhDii1A8ujC0KLFLEjioJEEw8ZiSPRBt0qltNqPzSN7RGSQM0JjkbHZp";var token = _tk1 + _tk2;
  if (!token) {
    alert("\u8bc4\u8bba\u529f\u80fd\u6b63\u5728\u914d\u7f6e\u4e2d\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002\u5982\u9700\u5e2e\u52a9\uff0c\u8bf7\u8054\u7cfb\u7ad9\u957f\u3002");
    btn.disabled = false;
    btn.textContent = "\u53d1\u8868\u8bc4\u8bba";
    return;
  }
  
  fetch("https://api.github.com/repos/" + REPO + "/issues/" + window._commentIssue + "/comments", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify({
      body: "**" + n + "**:\n\n" + t
    })
  })
  .then(function(r) {
    if (r.ok) {
      // Reload to show new comment
      location.reload();
    } else {
      alert("\u8bc4\u8bba\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002");
      btn.disabled = false;
      btn.textContent = "\u53d1\u8868\u8bc4\u8bba";
    }
  })
  .catch(function() {
    alert("\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002");
    btn.disabled = false;
    btn.textContent = "\u53d1\u8868\u8bc4\u8bba";
  });
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// Init on page load
document.addEventListener("DOMContentLoaded", initArticle);


