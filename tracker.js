/* AAvisit tracker - paste before </body> or load as a script */
(function () {
  // ====== CONFIG: replace these with your real values ======
  var CONFIG = {
    ENDPOINT: "YOUR_MOMEN_GRAPHQL_ENDPOINT",
    TOKEN: "YOUR_API_TOKEN_IF_REQUIRED", // leave "" if table allows public inserts
    TABLE: "ud_visit_a34c37",
    SITE_ID: "demo-site",
    HEARTBEAT_MS: 10000,
    // column API names (check these in Momen's data model)
    FIELDS: {
      visitor_id: "ud_visitor_id_d9b34e",
      country: "ud_country_a82290",
      page: "ud_page_161689",
      duration_seconds: "ud_duration_7c678d",
      visited_at: "ud_visited_at_3b6084"
    }
  };
  // =========================================================

  function gql(query, variables) {
    var headers = { "Content-Type": "application/json" };
    if (CONFIG.TOKEN) headers["Authorization"] = "Bearer " + CONFIG.TOKEN;
    return fetch(CONFIG.ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ query: query, variables: variables }),
      keepalive: true
    }).then(function (r) { return r.json(); });
  }

  function visitorId() {
    var k = "aavisit_vid";
    var id = localStorage.getItem(k);
    if (!id) {
      id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(k, id);
    }
    return id;
  }

  function getCountry() {
    return fetch("https://ipapi.co/json/")
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.country_name || "Unknown"; })
      .catch(function () { return "Unknown"; });
  }

  var F = CONFIG.FIELDS;
  var T = CONFIG.TABLE;
  var start = Date.now();
  var rowId = null;

  getCountry().then(function (country) {
    var obj = {};
    obj[F.visitor_id] = visitorId();
    obj[F.country] = country;
    obj[F.page] = location.pathname;
    obj[F.duration_seconds] = "0";
    obj[F.visited_at] = new Date().toISOString();

    var insert =
      "mutation($object: " + T + "_insert_input!) { insert_" + T +
      "_one(object: $object) { id } }";

    gql(insert, { object: obj }).then(function (res) {
      var row = res && res.data && res.data["insert_" + T + "_one"];
      if (!row) { console.warn("AAvisit insert failed", res); return; }
      rowId = row.id;
      setInterval(beat, CONFIG.HEARTBEAT_MS);
    });
  });

  function beat() {
    if (!rowId || document.hidden) return;
    var set = {};
    set[F.duration_seconds] = String(Math.round((Date.now() - start) / 1000));
    var update =
      "mutation($id: bigint!, $set: " + T + "_set_input!) { update_" + T +
      "_by_pk(pk_columns: {id: $id}, _set: $set) { id } }";
    gql(update, { id: rowId, set: set });
  }

  window.addEventListener("pagehide", beat);
})();
