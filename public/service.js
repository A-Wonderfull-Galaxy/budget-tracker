const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
  ];
  
  const CACHE_NAME = "budget_cache";
  
  self.addEventListener("install", (e) => {
    e.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (e) => {
    e.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch((err) => {
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
  });