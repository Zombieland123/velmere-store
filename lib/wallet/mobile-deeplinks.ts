export function isMobileViewport() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function currentDappUrl() {
  if (typeof window === "undefined") return "https://velmere-store.vercel.app";
  return `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function openMetaMaskMobileDapp() {
  if (typeof window === "undefined") return;
  const dapp = currentDappUrl().replace(/^https?:\/\//, "");
  window.location.assign(`https://link.metamask.io/dapp/${dapp}`);
}

export function openPhantomMobileBrowser() {
  if (typeof window === "undefined") return;
  const dapp = encodeURIComponent(currentDappUrl());
  const ref = encodeURIComponent(window.location.origin);
  window.location.assign(`https://phantom.app/ul/browse/${dapp}?ref=${ref}`);
}
