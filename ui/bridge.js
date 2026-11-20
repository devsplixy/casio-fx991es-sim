(function () {
  'use strict';

  var seq = 0;
  var waiting = new Map();

  window.__ipcReply = function (reply) {
    if (!reply || !waiting.has(reply.id)) return;
    var done = waiting.get(reply.id);
    waiting.delete(reply.id);
    done(reply);
  };

  function post(obj) {
    if (window.ipc && window.ipc.postMessage) window.ipc.postMessage(JSON.stringify(obj));
  }

  function call(obj, timeoutMs) {
    return new Promise(function (resolve) {
      var id = ++seq;
      waiting.set(id, resolve);
      post(Object.assign({ id: id }, obj));
      setTimeout(function () {
        if (waiting.has(id)) {
          waiting.delete(id);
          resolve({});
        }
      }, timeoutMs || 1200);
    });
  }

  window.casioWindow = {
    minimize: function () { post({ cmd: 'minimize' }); },
    close: function () { post({ cmd: 'close' }); },
    getOwnership: function () {
      return call({ cmd: 'getOwnership' }, 500).then(function (r) {
        return { confirmed: !!(r && r.confirmed) };
      });
    },
    setOwnership: function () {
      return call({ cmd: 'setOwnership' }, 500);
    },
    getSettings: function () {
      return call({ cmd: 'getSettings' }).then(function (r) {
        return r && r.settings && typeof r.settings === 'object' ? r.settings : {};
      });
    },
    setSettings: function (settings) {
      return call({ cmd: 'setSettings', settings: settings });
    },
    setScale: function (scale) {
      return call({ cmd: 'setScale', scale: scale }).then(function (r) {
        if (r && typeof r.scale === 'number') return r;
        return { scale: Math.max(0.45, Math.min(1.4, scale)), min: 0.45, max: 1.4 };
      });
    },
    getLimits: function () {
      return call({ cmd: 'getLimits' }).then(function (r) {
        if (r && typeof r.min === 'number') return r;
        return { min: 0.45, max: 1.4 };
      });
    }
  };

  var solar = document.getElementById('solar-panel');

  
  document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('#solar-panel')) return;
    post({ cmd: 'drag' });
  });

  
  
  document.addEventListener('keydown', function (e) {
    if (solar && document.activeElement === solar) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        solar.click();
        return;
      }
      if (e.key === 'Tab' || e.key === 'Shift') return;
    }
    var key = null;
    if (e.key === 'Shift') key = 'SHIFT';
    else if (e.key === 'CapsLock') key = 'ALPHA';
    else if (e.key === 'Tab') key = 'MODE';
    if (!key) return;
    e.preventDefault();
    var btn = document.querySelector('[data-key="' + key + '"]');
    if (btn) btn.click();
  });

  
  window.addEventListener('load', function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { post({ cmd: 'ready' }); });
    });
  });
})();