document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const siteYT = document.getElementById('siteYT');
  const siteIG = document.getElementById('siteIG');
  const siteTT = document.getElementById('siteTT');

  chrome.storage.local.get({ enabled: true, sites: { youtube: true, instagram: true, tiktok: true } }, (res) => {
    masterToggle.checked = res.enabled;
    siteYT.checked = res.sites.youtube;
    siteIG.checked = res.sites.instagram;
    siteTT.checked = res.sites.tiktok;
  });

  function save() {
    chrome.storage.local.set({
      enabled: masterToggle.checked,
      sites: {
        youtube: siteYT.checked,
        instagram: siteIG.checked,
        tiktok: siteTT.checked
      }
    });
  }

  masterToggle.addEventListener('change', save);
  siteYT.addEventListener('change', save);
  siteIG.addEventListener('change', save);
  siteTT.addEventListener('change', save);
});
