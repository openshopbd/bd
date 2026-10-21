let MAIN_CATEGORIES = [{
  value: "women",
  label: "নারীদের পোশাক",
  labelEn: "Women's Fashion",
  icon: "👗"
}, {
  value: "men",
  label: "পুরুষদের পোশাক",
  labelEn: "Men's Fashion",
  icon: "👔"
}, {
  value: "bags",
  label: "বাচ্চাদের পোশাক",
  labelEn: "Kids' Fashion",
  icon: "👕"
}, {
  value: "seasonal",
  label: "গৃহ সামগ্রী",
  labelEn: "Home Essentials",
  icon: "🏠"
}, {
  value: "electronics",
  label: "ইলেকট্রনিক আইটেম",
  labelEn: "Electronic Items",
  icon: "🔌"
}];
function mainCategoryLabel(_0x225c93) {
  const _0x5d1c86 = MAIN_CATEGORIES.find(_0xcae9d8 => _0xcae9d8.value === _0x225c93);
  if (_0x5d1c86) {
    return _0x5d1c86.label;
  } else {
    return _0x225c93;
  }
}
let cart = JSON.parse(localStorage.getItem("openshop_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("openshop_wishlist") || "[]");
let activeMainCategory = "সব";
let activeCategory = "সব";
let searchQuery = "";
let selectedSize = null;
let selectedImage = null;
let sortOrder = "default";
let minPriceFilter = null;
let maxPriceFilter = null;
let minRatingFilter = 0;
let appliedCoupons = [];
let COUPONS = [];
let REVIEWS = [];
let LIKES = [];
let likedProducts = JSON.parse(localStorage.getItem("openshop_liked") || "[]");
let SITE_LIKES_COUNT = 0;
let _db = null;
function firebaseIsConfigured() {
  return typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes("আপনার");
}
function getDb() {
  if (!firebaseIsConfigured()) {
    return null;
  }
  try {
    if (typeof firebase === "undefined") {
      return null;
    }
    if (!_db) {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      _db = firebase.firestore();
      try { _db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch (_e) {}
    }
    return _db;
  } catch (_0x5d7921) {
    console.warn("Firebase চালু করা যায়নি, স্ট্যাটিক ডেটা ব্যবহার হচ্ছে:", _0x5d7921.message);
    return null;
  }
}
async function loadLiveProducts() {
  const _0x2c4cfe = getDb();
  if (!_0x2c4cfe) {
    return;
  }
  try {
    const _0x1eb0ab = await _0x2c4cfe.collection("products").orderBy("updatedAt", "desc").get(navigator.onLine === false ? { source: "cache" } : undefined);
    if (!_0x1eb0ab.empty) {
      PRODUCTS = _0x1eb0ab.docs.map(_0x238bab => ({
        id: _0x238bab.id,
        ..._0x238bab.data()
      }));
      try { localStorage.setItem("openshop_products_cache", JSON.stringify(PRODUCTS)); } catch (_e) {}
    }
  } catch (_0x79a5f5) {
    console.warn("Firestore থেকে প্রোডাক্ট লোড করা যায়নি, স্ট্যাটিক তালিকা ব্যবহার হচ্ছে:", _0x79a5f5.message);
    try { if (!PRODUCTS.length) { const _c = JSON.parse(localStorage.getItem("openshop_products_cache") || "[]"); if (_c.length) PRODUCTS = _c; } } catch (_e) {}
  }
}
async function loadCoupons() {
  const _0x5c5227 = getDb();
  if (!_0x5c5227) {
    return;
  }
  try {
    const _0x43abc2 = await _0x5c5227.collection("coupons").get();
    COUPONS = _0x43abc2.docs.map(_0x48ecde => ({
      id: _0x48ecde.id,
      ..._0x48ecde.data()
    }));
  } catch (_0x1af195) {
    console.warn("কুপন লোড করা যায়নি:", _0x1af195.message);
  }
}
async function countCouponUsage(_0x4312a3) {
  const _0x7d727 = getDb();
  if (!_0x7d727) {
    return 0;
  }
  try {
    const _0x4312a3Upper = (_0x4312a3 || "").toUpperCase();
    const _0x450cc6 = await _0x7d727.collection("couponUsage").doc(_0x4312a3Upper).get();
    return _0x450cc6.exists ? Number(_0x450cc6.data().count) || 0 : 0;
  } catch (_0x14f4f7) {
    console.warn("কুপন ব্যবহারের সংখ্যা গোনা যায়নি:", _0x14f4f7.message);
    return 0;
  }
}
function getProductLineSubtotal(_0x875f81, _0x53f89d) {
  return _0x875f81.filter(_0x5ad311 => _0x5ad311.id === _0x53f89d).reduce((_0x56cafa, _0x5b18fd) => _0x56cafa + _0x5b18fd.price * _0x5b18fd.qty, 0);
}
async function validateCoupon(_0x139dd7, _0x424c13) {
  const _0x7fc8c7 = (_0x139dd7 || "").trim().toUpperCase();
  if (!_0x7fc8c7) {
    return {
      ok: false,
      reason: "একটা কুপন কোড লিখুন।"
    };
  }
  if (!COUPONS.length) {
    await loadCoupons();
  }
  const _0x4a71b5 = COUPONS.find(_0x5ede38 => (_0x5ede38.code || "").toUpperCase() === _0x7fc8c7);
  if (!_0x4a71b5) {
    return {
      ok: false,
      reason: "কুপন কোডটি সঠিক নয়।"
    };
  }
  if (_0x4a71b5.active === false) {
    return {
      ok: false,
      reason: "এই কুপনটি বর্তমানে বন্ধ আছে।"
    };
  }
  if (_0x4a71b5.expiry) {
    const _0x24ff44 = new Date().toISOString().slice(0, 10);
    if (_0x4a71b5.expiry < _0x24ff44) {
      return {
        ok: false,
        reason: "এই কুপনের মেয়াদ শেষ হয়ে গেছে।"
      };
    }
  }
  let _0x5d0b40;
  if (_0x4a71b5.productId) {
    _0x5d0b40 = getProductLineSubtotal(_0x424c13, _0x4a71b5.productId);
    if (_0x5d0b40 <= 0) {
      return {
        ok: false,
        reason: "এই কুপনটি \"" + (_0x4a71b5.productName || "একটি নির্দিষ্ট প্রোডাক্ট") + "\"-এর জন্য — আগে সেই প্রোডাক্টটা কার্টে যোগ করুন।"
      };
    }
  } else {
    _0x5d0b40 = _0x424c13.reduce((_0x37be81, _0x316bb7) => _0x37be81 + _0x316bb7.price * _0x316bb7.qty, 0);
  }
  const _0x4dd201 = Number(_0x4a71b5.minOrder || 0);
  if (_0x4dd201 > 0 && _0x5d0b40 < _0x4dd201) {
    return {
      ok: false,
      reason: "এই কুপন ব্যবহার করতে কমপক্ষে " + formatTaka(_0x4dd201) + " টাকার " + (_0x4a71b5.productId ? "ওই প্রোডাক্টের" : "") + " অর্ডার লাগবে।"
    };
  }
  if (_0x4a71b5.maxUses) {
    const _0x687551 = await countCouponUsage(_0x4a71b5.code);
    if (_0x687551 >= Number(_0x4a71b5.maxUses)) {
      return {
        ok: false,
        reason: "এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে।"
      };
    }
  }
  return {
    ok: true,
    coupon: _0x4a71b5
  };
}
function getProductCoupon(_0x3d8098) {
  if (!COUPONS || !COUPONS.length) {
    return null;
  }
  const _0x4993a9 = new Date().toISOString().slice(0, 10);
  return COUPONS.find(_0x2d6460 => _0x2d6460.productId === _0x3d8098 && _0x2d6460.active !== false && (!_0x2d6460.expiry || _0x2d6460.expiry >= _0x4993a9)) || null;
}
function offerTagHtml(_0x4cab76) {
  const _0x191486 = getProductCoupon(_0x4cab76);
  if (!_0x191486) {
    return "";
  }
  return "<span class=\"offer-tag\">🏷️ " + (_0x191486.label || "বিশেষ অফার") + "</span>";
}
function couponChipHtml(_0x5f3eb6) {
  const _0x32edbd = getProductCoupon(_0x5f3eb6);
  if (!_0x32edbd) {
    return "";
  }
  const _0x5fa926 = _0x32edbd.type === "free_delivery" ? "🚚 ফ্রি ডেলিভারি" : _0x32edbd.type === "fixed" ? formatTaka(_0x32edbd.value) + " ছাড়" : _0x32edbd.value + "% ছাড়";
  return "\n    <div class=\"coupon-chip\" title=\"এই প্রোডাক্টে অফার আছে — কোড কপি করুন অথবা বাটনে চাপলেই কার্টে যোগ হয়ে ছাড় প্রয়োগ হয়ে যাবে\">\n      <div class=\"coupon-chip-top\">\n        <span class=\"coupon-chip-code\">🏷️ " + (_0x32edbd.label || "বিশেষ অফার") + "</span>\n        <span class=\"coupon-chip-discount\">" + _0x5fa926 + "</span>\n      </div>\n      <div class=\"coupon-code-row\">\n        <span class=\"coupon-code-mini\">" + _0x32edbd.code + "</span>\n        <button type=\"button\" class=\"coupon-copy-btn\" data-code=\"" + _0x32edbd.code + "\" data-pid=\"" + _0x5f3eb6 + "\">কপি করুন</button>\n      </div>\n    </div>";
}
async function applyProductCouponFromChip(_0x551a9e, _0xc27b39, _0x476f63) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(_0x551a9e);
    } catch (_0x47d33d) {}
  }
  if (couponInput) {
    couponInput.value = _0x551a9e;
  }
  const _0x370acd = _0x476f63 ? _0x476f63.textContent : "";
  if (_0x476f63) {
    _0x476f63.disabled = true;
    _0x476f63.textContent = "কপি হয়েছে ✓";
  }
  if (_0xc27b39 && !cart.some(_0x2201b9 => _0x2201b9.id === _0xc27b39)) {
    addToCart(_0xc27b39, null, 1);
  }
  const _0x106d5e = await validateCoupon(_0x551a9e, cart);
  if (_0x476f63) {
    setTimeout(() => {
      _0x476f63.disabled = false;
      _0x476f63.textContent = _0x370acd;
    }, 1200);
  }
  if (_0x106d5e.ok) {
    const _0x4765c1 = _0x106d5e.coupon;
    appliedCoupons = appliedCoupons.filter(_0x1195b9 => _0x1195b9.productId ? _0x1195b9.productId !== _0x4765c1.productId : !!_0x4765c1.productId);
    appliedCoupons.push(_0x4765c1);
    showSiteToast("কোড কপি হয়েছে ও \"" + (_0x4765c1.label || "অফার") + "\" প্রয়োগ হয়ে গেছে 🎉");
    renderCart();
    openCart();
  } else {
    showSiteToast("কোড কপি হয়েছে — " + (_0x106d5e.reason || "তবে এখন কুপনটি প্রয়োগ করা যাচ্ছে না।"));
  }
}
async function loadReviews() {
  const _0x1616d1 = getDb();
  if (!_0x1616d1) {
    return;
  }
  try {
    const _0xd3bc83 = await _0x1616d1.collection("reviews").get();
    REVIEWS = _0xd3bc83.docs.map(_0xf86d11 => ({
      id: _0xf86d11.id,
      ..._0xf86d11.data()
    })).sort((_0x9555d9, _0x332022) => (_0x332022.ts || 0) - (_0x9555d9.ts || 0));
  } catch (_0x2a10b5) {
    console.warn("রিভিউ লোড করা যায়নি:", _0x2a10b5.message);
  }
}
function getProductRating(_0x164ce5) {
  const _0x1b22d2 = REVIEWS.filter(_0x4674ab => _0x4674ab.productId === _0x164ce5);
  if (!_0x1b22d2.length) {
    return {
      avg: 0,
      count: 0
    };
  }
  const _0x3f2388 = _0x1b22d2.reduce((_0x4b381d, _0x4cf475) => _0x4b381d + (Number(_0x4cf475.rating) || 0), 0);
  return {
    avg: _0x3f2388 / _0x1b22d2.length,
    count: _0x1b22d2.length
  };
}
function starsHtml(_0xaf315b, _0x35d232) {
  const _0x5554c3 = Math.round(_0xaf315b);
  let _0x4ac9e3 = "";
  for (let _0x5ac82c = 1; _0x5ac82c <= 5; _0x5ac82c++) {
    _0x4ac9e3 += "<span class=\"star " + (_0x5ac82c <= _0x5554c3 ? "filled" : "") + "\" style=\"" + (_0x35d232 ? "font-size:" + _0x35d232 + "px;" : "") + "\">★</span>";
  }
  return _0x4ac9e3;
}
function ratingBadgeHtml(_0x265d8d) {
  const {
    avg: _0x55912e,
    count: _0x432792
  } = getProductRating(_0x265d8d);
  if (_0x432792 === 0) {
    return "";
  }
  return "<div class=\"rating-badge\"><span class=\"stars-mini\">" + starsHtml(_0x55912e) + "</span><span class=\"rating-num\">" + _0x55912e.toFixed(1) + " (" + _0x432792 + ")</span></div>";
}
async function loadLikes() {
  const _0x2102df = getDb();
  if (!_0x2102df) {
    return;
  }
  try {
    const _0x8b9d3 = await _0x2102df.collection("likes").get();
    LIKES = _0x8b9d3.docs.map(_0x25733c => ({
      id: _0x25733c.id,
      ..._0x25733c.data()
    }));
  } catch (_0x5a4e00) {
    console.warn("লাইক লোড করা যায়নি:", _0x5a4e00.message);
  }
}
function isLiked(_0x411168) {
  return likedProducts.includes(_0x411168);
}
function getLikeCount(_0x1845f0) {
  return LIKES.filter(_0x9cb115 => _0x9cb115.productId === _0x1845f0).length;
}
function saveLikedProducts() {
  localStorage.setItem("openshop_liked", JSON.stringify(likedProducts));
}
function likeSvg() {
  return "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M7 10v11M2 13v6a2 2 0 0 0 2 2h13.4a2 2 0 0 0 2-1.6l1.3-7A2 2 0 0 0 18.7 10H14V5a2 2 0 0 0-2-2l-3 7v11\"/></svg>";
}
function likeButtonHtml(_0x486d69) {
  const _0x355021 = isLiked(_0x486d69);
  const _0x158210 = getLikeCount(_0x486d69);
  return "<button class=\"like-btn " + (_0x355021 ? "active" : "") + "\" data-id=\"" + _0x486d69 + "\" " + (_0x355021 ? "disabled" : "") + ">" + likeSvg() + " <span>লাইক</span> <span class=\"like-count\">" + _0x158210 + "</span></button>";
}
function likeProduct(_0x49802d) {
  if (isLiked(_0x49802d)) {
    return;
  }
  likedProducts.push(_0x49802d);
  saveLikedProducts();
  LIKES.push({
    productId: _0x49802d,
    ts: Date.now()
  });
  document.querySelectorAll(".like-btn[data-id=\"" + _0x49802d + "\"]").forEach(_0x1e3caf => {
    _0x1e3caf.classList.add("active");
    _0x1e3caf.disabled = true;
    const _0x46adfa = _0x1e3caf.querySelector(".like-count");
    if (_0x46adfa) {
      _0x46adfa.textContent = getLikeCount(_0x49802d);
    }
  });
  const _0x5b288f = getDb();
  if (_0x5b288f) {
    _0x5b288f.collection("likes").add({
      productId: _0x49802d,
      ts: Date.now()
    }).catch(() => {});
  }
}
const SITE_LIKE_BASE = 435;
async function loadSiteLikesCount() {
  const _0x12ea17 = localStorage.getItem("openshop_site_likes_count_cache");
  if (_0x12ea17 !== null) {
    SITE_LIKES_COUNT = parseInt(_0x12ea17, 10) || 0;
  }
  const _0xfe79e9 = getDb();
  if (!_0xfe79e9) {
    return;
  }
  try {
    const _0xef1b85 = await _0xfe79e9.collection("siteLikes").get();
    SITE_LIKES_COUNT = _0xef1b85.size;
    localStorage.setItem("openshop_site_likes_count_cache", String(SITE_LIKES_COUNT));
  } catch (_0x55cb73) {
    console.warn("সাইট লাইক কাউন্ট লোড করা যায়নি (ক্যাশ করা সংখ্যা দেখানো হচ্ছে):", _0x55cb73.message);
  }
}
function getSiteLikeCount() {
  return SITE_LIKE_BASE + SITE_LIKES_COUNT;
}
function isSiteLiked() {
  return localStorage.getItem("openshop_site_liked") === "1";
}
function renderSiteLikeUI() {
  const _0x3a0eca = getSiteLikeCount();
  const _0x2b8f89 = isSiteLiked();
  const _0x50932b = document.getElementById("siteLikeCount");
  if (_0x50932b) {
    bumpBadge(_0x50932b, _0x3a0eca);
  }
  const _0x4b5f76 = document.getElementById("siteLikeBtn");
  if (_0x4b5f76) {
    _0x4b5f76.classList.toggle("site-liked", _0x2b8f89);
  }
}
function toggleSiteLike() {
  if (isSiteLiked()) {
    return;
  }
  localStorage.setItem("openshop_site_liked", "1");
  SITE_LIKES_COUNT += 1;
  renderSiteLikeUI();
  showSiteToast("ওয়েবসাইটটি লাইক করার জন্য ধন্যবাদ! 👍");
  const _0x4eadbb = getDb();
  if (_0x4eadbb) {
    _0x4eadbb.collection("siteLikes").add({
      ts: Date.now()
    }).catch(() => {});
  }
}
const utilShareBtn = document.getElementById("utilShareSite");
if (utilShareBtn) {
  utilShareBtn.addEventListener("click", async () => {
    const _0x259325 = {
      title: document.title,
      text: "Openshop-এ ভালো দামে পছন্দের সব প্রোডাক্ট পাবেন — দেখে আসুন!",
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(_0x259325);
      } catch (_0x2f711b) {}
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_0x259325.url).then(() => {
        showSiteToast("ওয়েবসাইটের লিংক কপি হয়েছে! এখন যেকোনো জায়গায় পেস্ট করে শেয়ার করুন 🔗");
      });
    } else {
      showSiteToast(_0x259325.url);
    }
  });
}
const utilLikeBtn = document.getElementById("siteLikeBtn");
if (utilLikeBtn) {
  utilLikeBtn.addEventListener("click", _0x14edcf => {
    _0x14edcf.preventDefault();
    toggleSiteLike();
  });
}
function syncWhatsappLinks() {
  const _0x1f7dd3 = window.WHATSAPP_NUMBER_OVERRIDE || WHATSAPP_NUMBER;
  const _0x4c82af = document.getElementById("waFloat");
  if (_0x4c82af) {
    _0x4c82af.href = "https://wa.me/" + _0x1f7dd3;
  }
  const _0x3167a5 = document.getElementById("footerWhatsapp");
  if (_0x3167a5) {
    _0x3167a5.href = "https://wa.me/" + _0x1f7dd3;
  }
}
function syncMessengerLinks() {
  const _0xc13b01 = window.MESSENGER_PAGE_ID_OVERRIDE || (typeof MESSENGER_PAGE_ID !== "undefined" ? MESSENGER_PAGE_ID : "");
  if (!_0xc13b01) {
    return;
  }
  const _0x47f745 = document.getElementById("messengerFloat");
  if (_0x47f745) {
    _0x47f745.href = "https://m.me/" + _0xc13b01;
  }
  const _0x1cb3b3 = document.getElementById("footerMessenger");
  if (_0x1cb3b3) {
    _0x1cb3b3.href = "https://m.me/" + _0xc13b01;
  }
  const _0x4ea56d = "https://www.facebook.com/" + _0xc13b01;
  const _0x12150c = document.getElementById("utilFacebookPage");
  if (_0x12150c) {
    _0x12150c.href = _0x4ea56d;
  }
  const _0x2735cd = document.getElementById("utilCustomerCare");
  if (_0x2735cd) {
    _0x2735cd.href = "https://m.me/" + _0xc13b01;
    _0x2735cd.target = "_blank";
    _0x2735cd.rel = "noopener";
  }
}
async function loadSiteSettings() {
  syncWhatsappLinks();
  syncMessengerLinks();
  const _0xf1cffd = getDb();
  let _0x1e0f2c = null;
  const _0x987ccf = localStorage.getItem("openshop_site_settings_cache");
  const _0x4dbf3c = _0x987ccf ? JSON.parse(_0x987ccf) : null;
  if (_0xf1cffd) {
    try {
      const _0xa3d283 = await _0xf1cffd.collection("settings").doc("main").get();
      if (_0xa3d283.exists) {
        _0x1e0f2c = _0xa3d283.data();
        localStorage.setItem("openshop_site_settings_cache", JSON.stringify(_0x1e0f2c));
      }
    } catch (_0x3eace3) {
      console.warn("সাইট সেটিংস লোড করা যায়নি (ক্যাশ করা তথ্য দেখানো হচ্ছে):", _0x3eace3.message);
    }
  }
  if (!_0x1e0f2c) {
    _0x1e0f2c = _0x4dbf3c;
  }
  if (!_0x1e0f2c) {
    return;
  }
  try {
    if (_0x1e0f2c.coverImage) {
      const _0x2b0519 = document.getElementById("heroSlideBg0");
      if (_0x2b0519) {
        _0x2b0519.style.backgroundImage = "url('" + _0x1e0f2c.coverImage + "')";
      }
    }
    if (_0x1e0f2c.logoImage) {
      const _0x47c3f1 = document.getElementById("headerLogo");
      if (_0x47c3f1) {
        _0x47c3f1.src = _0x1e0f2c.logoImage;
      }
    }
    if (_0x1e0f2c.heroEyebrow) {
      document.getElementById("heroEyebrow").textContent = _0x1e0f2c.heroEyebrow;
    }
    if (_0x1e0f2c.heroTitle) {
      document.getElementById("heroTitle").innerHTML = _0x1e0f2c.heroTitle;
    }
    if (_0x1e0f2c.heroDesc) {
      document.getElementById("heroDesc").textContent = _0x1e0f2c.heroDesc;
    }
    if (_0x1e0f2c.address) {
      document.getElementById("footerAddress").textContent = _0x1e0f2c.address;
    }
    if (_0x1e0f2c.phone) {
      const _0x103277 = document.getElementById("footerPhone");
      if (_0x103277) {
        _0x103277.textContent = _0x1e0f2c.phone;
        _0x103277.href = "tel:+" + _0x1e0f2c.phone.replace(/\D/g, "");
      }
    }
    if (_0x1e0f2c.email) {
      const _0x1acdfd = document.getElementById("footerEmail");
      if (_0x1acdfd) {
        _0x1acdfd.textContent = _0x1e0f2c.email;
        _0x1acdfd.href = "mailto:" + _0x1e0f2c.email;
      }
    }
    if (_0x1e0f2c.facebookLink) {
      const _0x489d3e = document.getElementById("fbLink");
      if (_0x489d3e) {
        _0x489d3e.href = _0x1e0f2c.facebookLink;
      }
    }
    if (_0x1e0f2c.whatsapp) {
      window.WHATSAPP_NUMBER_OVERRIDE = toWhatsappNumber(_0x1e0f2c.whatsapp);
    }
    if (_0x1e0f2c.messengerId) {
      window.MESSENGER_PAGE_ID_OVERRIDE = _0x1e0f2c.messengerId.trim();
    }
    syncWhatsappLinks();
    syncMessengerLinks();
    if (_0x1e0f2c.siteName && _0x1e0f2c.siteName.trim()) {
      const _0x3152b5 = document.getElementById("brandNameHeader");
      const _0x554e2e = document.getElementById("brandNameFooter");
      if (_0x3152b5) {
        _0x3152b5.textContent = _0x1e0f2c.siteName;
      }
      if (_0x554e2e) {
        _0x554e2e.textContent = _0x1e0f2c.siteName;
      }
      document.title = document.title.replace(/^[^|]+/, _0x1e0f2c.siteName + " ");
    }
    const _0x25414d = {
      sLogoSize: "--logo-size",
      sContainerWidth: "--container-width",
      sCardRadius: "--radius",
      sBtnRadius: "--btn-radius",
      sHeroPad: "--hero-extra-pad",
      sBodyFontSize: "--body-font-size",
      sProductNameSize: "--product-name-size",
      sPriceSize: "--price-size",
      sSectionTitleSize: "--section-title-size"
    };
    const _0x607545 = document.documentElement.style;
    Object.keys(_0x25414d).forEach(_0x26c428 => {
      if (_0x1e0f2c[_0x26c428] !== undefined && _0x1e0f2c[_0x26c428] !== null && _0x1e0f2c[_0x26c428] !== "") {
        _0x607545.setProperty(_0x25414d[_0x26c428], _0x1e0f2c[_0x26c428] + "px");
      }
    });
    const _0x2b6af9 = {
      brandTagline: "brandTagline",
      footerTagline: "footerTagline",
      navProducts: "navProducts",
      navCategories: "navCategories",
      navAbout: "navAbout",
      navContact: "navContact",
      trustBar1: "trustBar1",
      trustBar2: "trustBar2",
      trustBar3: "trustBar3",
      productsTitle: "productsTitle",
      productsDesc: "productsDesc",
      emptyStateText: "emptyState",
      aboutTitle: "aboutTitle",
      about1Title: "about1Title",
      about1Desc: "about1Desc",
      about2Title: "about2Title",
      about2Desc: "about2Desc",
      about3Title: "about3Title",
      about3Desc: "about3Desc",
      footerContactTitle: "footerContactTitle",
      footerHoursTitle: "footerHoursTitle",
      footerHoursText: "footerHoursText",
      footerHotline: "footerHotline",
      copyrightText: "copyrightText",
      cartTitle: "cartTitle",
      cartNote: "cartNote",
      checkoutBtnText: "checkoutBtn",
      orderConfirmTitle: "orderConfirmTitle",
      orderConfirmDesc: "orderConfirmDesc",
      bnHome: "bnHome",
      bnCategories: "bnCategories",
      bnSearch: "bnSearch",
      bnCart: "bnCart",
      bnProfile: "bnProfile"
    };
    Object.keys(_0x2b6af9).forEach(_0x7ada48 => {
      if (_0x1e0f2c[_0x7ada48] && _0x1e0f2c[_0x7ada48].trim()) {
        const _0x209b25 = document.getElementById(_0x2b6af9[_0x7ada48]);
        if (_0x209b25) {
          _0x209b25.textContent = _0x1e0f2c[_0x7ada48];
        }
      }
    });
    if (_0x1e0f2c.searchPlaceholder && _0x1e0f2c.searchPlaceholder.trim() && searchInput) {
      searchInput.placeholder = _0x1e0f2c.searchPlaceholder;
    }
    if (_0x1e0f2c.primaryColor || _0x1e0f2c.accentColor || _0x1e0f2c.backgroundColor || _0x1e0f2c.textColor || _0x1e0f2c.headerBg || _0x1e0f2c.footerBg) {
      const _0x276a83 = document.documentElement.style;
      if (_0x1e0f2c.primaryColor) {
        _0x276a83.setProperty("--teal", _0x1e0f2c.primaryColor);
        _0x276a83.setProperty("--teal-dark", _0x1e0f2c.primaryColor);
      }
      if (_0x1e0f2c.accentColor) {
        _0x276a83.setProperty("--amber", _0x1e0f2c.accentColor);
        _0x276a83.setProperty("--coral", _0x1e0f2c.accentColor);
      }
      if (_0x1e0f2c.backgroundColor) {
        _0x276a83.setProperty("--cream", _0x1e0f2c.backgroundColor);
      }
      if (_0x1e0f2c.textColor) {
        _0x276a83.setProperty("--ink", _0x1e0f2c.textColor);
      }
      if (_0x1e0f2c.headerBg) {
        _0x276a83.setProperty("--header-bg", _0x1e0f2c.headerBg);
      }
      if (_0x1e0f2c.footerBg) {
        _0x276a83.setProperty("--footer-bg", _0x1e0f2c.footerBg);
      }
    }
    if (_0x1e0f2c.fontFamily && _0x1e0f2c.fontFamily.trim()) {
      document.documentElement.style.setProperty("--font-body", "'" + _0x1e0f2c.fontFamily + "', sans-serif");
    }
    const _0x147e34 = document.getElementById("top");
    if (_0x147e34) {
      _0x147e34.classList.toggle("hidden", _0x1e0f2c.showHero === false);
    }
    const _0x4d7221 = document.getElementById("trustBarWrap");
    if (_0x4d7221) {
      _0x4d7221.classList.toggle("hidden", _0x1e0f2c.showTrustBar === false);
    }
    const _0x123ef6 = document.getElementById("about");
    if (_0x123ef6) {
      _0x123ef6.classList.toggle("hidden", _0x1e0f2c.showAbout === false);
    }
    if (Array.isArray(_0x1e0f2c.mainCategories) && _0x1e0f2c.mainCategories.length) {
      MAIN_CATEGORIES = _0x1e0f2c.mainCategories;
    }
    const _0x2f2866 = document.getElementById("offerBanner");
    if (_0x2f2866) {
      if (_0x1e0f2c.offerBannerText && _0x1e0f2c.offerBannerText.trim()) {
        _0x2f2866.textContent = _0x1e0f2c.offerBannerText;
        _0x2f2866.classList.remove("hidden");
      } else {
        _0x2f2866.classList.add("hidden");
      }
    }
  } catch (_0x39139d) {
    console.warn("সাইট সেটিংস লোড করা যায়নি:", _0x39139d.message);
  }
}
// প্রতিটি ভিজিটরের জন্য একটা স্থায়ী আইডি — লোকেশন আর নাম/ফোন একসাথে মেলানোর জন্য
function getVisitorId() {
  try {
    let _v = localStorage.getItem("openshop_vid");
    if (!_v) {
      _v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("openshop_vid", _v);
    }
    return _v;
  } catch (_e) {
    return null;
  }
}
function logEvent(_0x469751, _0x5e0e8b) {
  const _0x6529a3 = getDb();
  if (!_0x6529a3) {
    return;
  }
  const _extra = {};
  const _vid = getVisitorId();
  if (_vid) {
    _extra.vid = _vid;
  }
  // লোকেশন ইভেন্টের সাথে নাম/ফোন জানা থাকলে সেটাও যাবে
  if (_0x469751 === "visitor_location") {
    try {
      const _c = typeof getSavedCustomer === "function" ? getSavedCustomer() : null;
      const _n = _c && _c.name || "";
      const _p = _c && _c.phone || localStorage.getItem("openshop_profile_phone") || "";
      if (_n) {
        _extra.name = _n;
      }
      if (_p) {
        _extra.phone = _p;
      }
    } catch (_e) {}
  }
  _0x6529a3.collection("events").add({
    type: _0x469751,
    ..._0x5e0e8b,
    ..._extra,
    ts: Date.now(),
    day: new Date().toISOString().slice(0, 10)
  }).catch(() => {});
}
let visitorLocation = null;
let locationPending = false;
const locationWaiters = [];
function saveLocationCache(_0x33a2d5) {
  try {
    localStorage.setItem("openshop_geo_cache", JSON.stringify({
      ..._0x33a2d5,
      ts: Date.now()
    }));
  } catch (_0x45843d) {}
}
function loadLocationCache() {
  try {
    const _0xd2f5c = localStorage.getItem("openshop_geo_cache");
    if (!_0xd2f5c) {
      return null;
    }
    const _0xe3b5b4 = JSON.parse(_0xd2f5c);
    if (!_0xe3b5b4.ts || Date.now() - _0xe3b5b4.ts > 21600000 || typeof _0xe3b5b4.lat !== "number") {
      return null;
    }
    return _0xe3b5b4;
  } catch (_0x3d6f3e) {
    return null;
  }
}
// ঠিকানা খোঁজা (reverse geocode) — এখন সর্বোচ্চ ৬ সেকেন্ড অপেক্ষা করে, আটকে থাকলেও লোকেশন সেভ হতে বাধা দেয় না।
// কাস্টম হেডার বাদ দেওয়া হয়েছে (আগের Accept-Language হেডার CORS preflight ঘটিয়ে অনেক সময় রিকোয়েস্ট ফেল করাত)।
async function reverseGeocode(_lat, _lng) {
  let _timer = null;
  try {
    const _ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    if (_ctl) {
      _timer = setTimeout(() => _ctl.abort(), 6000);
    }
    const _res = await fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + _lat + "&lon=" + _lng + "&zoom=16&addressdetails=1&accept-language=bn,en", _ctl ? {
      signal: _ctl.signal
    } : undefined);
    if (!_res.ok) {
      return null;
    }
    const _j = await _res.json();
    return _j && _j.display_name ? _j.display_name : null;
  } catch (_e) {
    return null;
  } finally {
    if (_timer) {
      clearTimeout(_timer);
    }
  }
}
// ---- লোকেশন কার্ডের UI (কার্ট ও স্বাগতম শিট — দুই জায়গার কার্ড একসাথে আপডেট হয়) ----
const LOC_UI = {
  idle: {
    t: "আপনার লোকেশন দিন",
    s: "সঠিক ডেলিভারি ও ভুয়া অর্ডার ঠেকাতে দরকার",
    b: "লোকেশন দিন"
  },
  loading: {
    t: "লোকেশন নেওয়া হচ্ছে…",
    s: "ব্রাউজারের পপআপে \"Allow\" চাপুন",
    b: "অপেক্ষা করুন"
  },
  ok: {
    t: "লোকেশন পাওয়া গেছে",
    s: "আপনার অবস্থান নিরাপদে সেভ হয়েছে",
    b: ""
  },
  denied: {
    t: "লোকেশন ব্লক করা আছে",
    s: "ঠিকানা বারের 🔒 আইকন → লোকেশন → Allow করুন, তারপর আবার চাপুন",
    b: "আবার চেষ্টা"
  },
  error: {
    t: "লোকেশন পাওয়া যায়নি",
    s: "GPS ও ইন্টারনেট চালু আছে কিনা দেখে আবার চেষ্টা করুন",
    b: "আবার চেষ্টা"
  },
  unsupported: {
    t: "এই ব্রাউজারে লোকেশন চলে না",
    s: "লিংকটা কপি করে Chrome/Safari-তে খুলুন (ফেসবুকের ভেতরের ব্রাউজারে হয় না)",
    b: "লিংক কপি"
  }
};
function setLocUI(_state) {
  const _ui = LOC_UI[_state] || LOC_UI.idle;
  document.querySelectorAll("[data-loc-card]").forEach(_card => {
    _card.dataset.state = _state;
    const _t = _card.querySelector("[data-loc-title]");
    const _s = _card.querySelector("[data-loc-sub]");
    const _b = _card.querySelector("[data-loc-btn]");
    if (_t) {
      _t.textContent = _ui.t;
    }
    if (_s) {
      let _sub = _ui.s;
      if (_state === "ok" && visitorLocation && visitorLocation.address) {
        _sub = visitorLocation.address.split(",").slice(0, 3).join(",").trim();
      }
      _s.textContent = _sub;
    }
    if (_b) {
      _b.textContent = _ui.b;
      _b.disabled = _state === "loading";
      _b.hidden = _state === "ok";
    }
  });
}
function afterLocationDone(_ok, _arg) {
  locationPending = false;
  locationWaiters.splice(0).forEach(_w => {
    try {
      if (_ok) {
        if (_w.ok) {
          _w.ok(_arg);
        }
      } else if (_w.fail) {
        _w.fail(_arg);
      }
    } catch (_e) {}
  });
}
// onOk/onFail দিলে ইউজারের ট্যাপ থেকে ডাকা হচ্ছে ধরে নিয়ে সরাসরি পারমিশন চায়।
// কিছু না দিলে (সাইলেন্ট মোড): পপআপ ছাড়াই শুধু ক্যাশ বা আগে-থেকে-Allow-করা পারমিশন ব্যবহার করে।
function captureVisitorLocation(_onOk, _onFail) {
  const _silent = !_onOk && !_onFail;
  if (visitorLocation) {
    setLocUI("ok");
    if (_onOk) {
      _onOk(visitorLocation);
    }
    return;
  }
  const _cached = loadLocationCache();
  if (_cached) {
    visitorLocation = _cached;
    setLocUI("ok");
    if (_onOk) {
      _onOk(visitorLocation);
    }
    return;
  }
  if (!("geolocation" in navigator) || window.isSecureContext === false) {
    setLocUI("unsupported");
    if (_onFail) {
      _onFail("no-geolocation");
    }
    return;
  }
  if (_silent) {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({
          name: "geolocation"
        }).then(_st => {
          if (_st.state === "granted") {
            captureVisitorLocation(() => {}, () => {});
          } else if (_st.state === "denied") {
            setLocUI("denied");
          }
        }).catch(() => {});
      }
    } catch (_e) {}
    return;
  }
  locationWaiters.push({
    ok: _onOk,
    fail: _onFail
  });
  if (locationPending) {
    return;
  }
  locationPending = true;
  setLocUI("loading");
  const _onPos = _pos => {
    const _lat = _pos.coords.latitude;
    const _lng = _pos.coords.longitude;
    const _acc = _pos.coords.accuracy;
    visitorLocation = {
      lat: _lat,
      lng: _lng,
      accuracy: _acc,
      mapsUrl: "https://www.google.com/maps?q=" + _lat + "," + _lng,
      address: null
    };
    // আগে ঠিকানা খোঁজার জন্য অপেক্ষা করা হতো — সেটা আটকে গেলে "Allow" দিলেও লোকেশন সেট হতো না। এখন সাথে সাথেই সেট।
    saveLocationCache(visitorLocation);
    setLocUI("ok");
    afterLocationDone(true, visitorLocation);
    reverseGeocode(_lat, _lng).then(_addr => {
      if (_addr && visitorLocation) {
        visitorLocation.address = _addr;
        saveLocationCache(visitorLocation);
        setLocUI("ok");
      }
      logEvent("visitor_location", {
        lat: _lat,
        lng: _lng,
        accuracy: _acc,
        mapsUrl: "https://www.google.com/maps?q=" + _lat + "," + _lng,
        address: _addr || null
      });
    });
  };
  const _fail = _err => {
    const _denied = !!_err && _err.code === 1;
    setLocUI(_denied ? "denied" : "error");
    afterLocationDone(false, _denied ? "denied" : "error");
  };
  navigator.geolocation.getCurrentPosition(_onPos, _e1 => {
    if (_e1 && _e1.code === 1) {
      _fail(_e1);
      return;
    }
    // নেটওয়ার্ক-ভিত্তিক লোকেশন ফেল/টাইমআউট করলে একবার GPS দিয়ে চেষ্টা
    navigator.geolocation.getCurrentPosition(_onPos, _fail, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    });
  }, {
    enableHighAccuracy: false,
    timeout: 12000,
    maximumAge: 21600000
  });
}
// লোকেশন কার্ডের বাটন (কার্ট ও স্বাগতম শিট দুই জায়গাতেই)
document.addEventListener("click", _ev => {
  const _btn = _ev.target.closest && _ev.target.closest("[data-loc-btn]");
  if (!_btn) {
    return;
  }
  const _card = _btn.closest("[data-loc-card]");
  if (_card && _card.dataset.state === "unsupported") {
    try {
      navigator.clipboard.writeText(location.href).then(() => showSiteToast("লিংক কপি হয়েছে — Chrome/Safari-তে পেস্ট করে খুলুন", "🔗"));
    } catch (_e) {}
    return;
  }
  captureVisitorLocation(() => {}, () => {});
});
const catPills = document.getElementById("catPills");
const productGrid = document.getElementById("productGrid");
// ===== মোবাইলের ব্যাক বাটন সাপোর্ট =====
// কার্ট / প্রোফাইল / পছন্দের তালিকা / কুপন / অর্ডার-কনফার্ম খুলে ব্যাক চাপলে সাইট থেকে বেরিয়ে না গিয়ে শুধু সেটা বন্ধ হবে।
// প্রতিটি খোলার সময় একটা history entry যোগ হয়, ব্যাক চাপলে (popstate) সবচেয়ে উপরের লেয়ারটা বন্ধ হয়।
var _bkPending = [];
var _bkQueue = [];
var _bkLayers = [];
var _bkClosers = {};
window.__bkSkipProduct = false;
function histBack(kind, n) {
  _bkPending.push(kind || "other");
  try {
    history.go(-(n || 1));
  } catch (e) {
    _bkPending.pop();
  }
}
function histRun(fn, name) {
  if (_bkPending.length) {
    _bkQueue.push({ fn: fn, name: name || null });
  } else {
    try {
      fn();
    } catch (e) {}
  }
}
function _bkTrimGhosts() {
  let g = 0;
  while (_bkLayers.length && _bkLayers[_bkLayers.length - 1].ghost) {
    _bkLayers.pop();
    g++;
  }
  return g;
}
function layerOpen(name, closeDom) {
  _bkClosers[name] = closeDom;
  if (_bkLayers.some(l => l.name === name && !l.ghost)) {
    return;
  }
  _bkLayers.push({ name: name, ghost: false });
  histRun(function () {
    history.pushState({ layer: name }, "", window.location.href);
  }, name);
}
function layerClose(name, closeDom) {
  closeDom();
  let i = -1;
  for (let k = _bkLayers.length - 1; k >= 0; k--) {
    if (_bkLayers[k].name === name && !_bkLayers[k].ghost) {
      i = k;
      break;
    }
  }
  if (i === -1) {
    return;
  }
  const qi = _bkQueue.findIndex(q => q.name === name);
  if (qi !== -1) {
    _bkQueue.splice(qi, 1);
    _bkLayers.splice(i, 1);
    return;
  }
  if (i === _bkLayers.length - 1) {
    _bkLayers.pop();
    const g = _bkTrimGhosts();
    histBack("layer", 1 + g);
  } else {
    _bkLayers[i].ghost = true;
  }
}
window.addEventListener("popstate", function () {
  window.__bkSkipProduct = false;
  if (_bkPending.length) {
    const kind = _bkPending.shift();
    if (kind === "layer") {
      window.__bkSkipProduct = true;
    }
    if (!_bkPending.length) {
      _bkQueue.splice(0).forEach(q => {
        try {
          q.fn();
        } catch (e) {}
      });
    }
    return;
  }
  const ws = document.getElementById("welcomeOverlay");
  if (ws && ws.classList.contains("open")) {
    return;
  }
  if (_bkLayers.length) {
    const top = _bkLayers.pop();
    window.__bkSkipProduct = true;
    if (_bkClosers[top.name] && !top.ghost) {
      _bkClosers[top.name]();
    }
    const g = _bkTrimGhosts();
    if (g) {
      histBack("layer", g);
    }
  }
});
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");
const cartBtn = document.getElementById("cartBtn");
function flyToCart(_0x98e5ab) {
  if (!_0x98e5ab || !cartBtn) {
    return;
  }
  const _0x5177e8 = _0x98e5ab.getBoundingClientRect();
  const _0x3c1f08 = cartBtn.getBoundingClientRect();
  if (!_0x5177e8.width || !_0x3c1f08.width) {
    return;
  }
  const _0x1f7c4e = _0x98e5ab.cloneNode(true);
  _0x1f7c4e.removeAttribute("id");
  _0x1f7c4e.className = "fly-to-cart-clone";
  Object.assign(_0x1f7c4e.style, {
    position: "fixed",
    left: _0x5177e8.left + "px",
    top: _0x5177e8.top + "px",
    width: _0x5177e8.width + "px",
    height: _0x5177e8.height + "px",
    margin: "0"
  });
  document.body.appendChild(_0x1f7c4e);
  const _0x45c3bd = _0x3c1f08.left + _0x3c1f08.width / 2 - (_0x5177e8.left + _0x5177e8.width / 2);
  const _0x2741bc = _0x3c1f08.top + _0x3c1f08.height / 2 - (_0x5177e8.top + _0x5177e8.height / 2);
  requestAnimationFrame(() => {
    _0x1f7c4e.style.transform = "translate(" + _0x45c3bd + "px, " + _0x2741bc + "px) scale(0.12) rotate(18deg)";
    _0x1f7c4e.style.opacity = "0.25";
  });
  const _0x2175a9 = () => {
    if (_0x1f7c4e.parentNode) {
      _0x1f7c4e.remove();
    }
    cartBtn.classList.add("cart-bump");
    setTimeout(() => cartBtn.classList.remove("cart-bump"), 500);
  };
  _0x1f7c4e.addEventListener("transitionend", _0x2175a9, {
    once: true
  });
  setTimeout(_0x2175a9, 1150);
}
document.addEventListener("click", _0x197fc4 => {
  const _0x3c8906 = _0x197fc4.target.closest(".btn, .add-btn, .buy-now-btn, .coupon-copy-btn, .icon-btn, .qty-btn, .cat-pill, .hero-dot");
  if (!_0x3c8906 || _0x3c8906.disabled) {
    return;
  }
  const _0x139f3c = _0x3c8906.classList.contains("icon-btn") ? _0x3c8906.querySelector(".icon-btn-clip") || _0x3c8906 : _0x3c8906;
  const _0x13593e = _0x139f3c.getBoundingClientRect();
  const _0xaab6e1 = Math.max(_0x13593e.width, _0x13593e.height) * 1.4;
  const _0x1315e4 = document.createElement("span");
  _0x1315e4.className = "ripple-effect";
  _0x1315e4.style.width = _0x1315e4.style.height = _0xaab6e1 + "px";
  _0x1315e4.style.left = _0x197fc4.clientX - _0x13593e.left - _0xaab6e1 / 2 + "px";
  _0x1315e4.style.top = _0x197fc4.clientY - _0x13593e.top - _0xaab6e1 / 2 + "px";
  _0x139f3c.appendChild(_0x1315e4);
  setTimeout(() => _0x1315e4.remove(), 600);
});
const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(_0x146bc9 => {
  _0x146bc9.forEach(_0x575296 => {
    if (_0x575296.isIntersecting) {
      _0x575296.target.classList.add("revealed");
      revealObserver.unobserve(_0x575296.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -40px 0px"
}) : null;
function markReveal(_0x262779, _0x483c7) {
  if (!revealObserver) {
    _0x262779.forEach(_0x244e65 => _0x244e65.classList.add("reveal-on-scroll", "revealed"));
    return;
  }
  _0x262779.forEach((_0x2dc403, _0x20a9d3) => {
    _0x2dc403.classList.add("reveal-on-scroll");
    if (_0x483c7) {
      _0x2dc403.style.transitionDelay = _0x20a9d3 % 10 * _0x483c7 + "s";
    }
    revealObserver.observe(_0x2dc403);
  });
}
const topStickyGroup = document.querySelector(".top-sticky-group");
if (topStickyGroup) {
  window.addEventListener("scroll", () => {
    topStickyGroup.classList.toggle("is-scrolled", window.scrollY > 8);
  }, {
    passive: true
  });
}
function popNumberChange(_0x231eaf) {
  if (!_0x231eaf) {
    return;
  }
  _0x231eaf.classList.remove("count-pop");
  _0x231eaf.offsetWidth;
  _0x231eaf.classList.add("count-pop");
}
function fireConfetti() {
  const _0x18578f = ["#0F6E5D", "#FF7A59", "#F6C453", "#4C7BD9", "#E2136E"];
  const _0x41d0ab = 26;
  for (let _0x4328b7 = 0; _0x4328b7 < _0x41d0ab; _0x4328b7++) {
    const _0x235bbd = document.createElement("span");
    _0x235bbd.className = "confetti-piece";
    const _0x4cfdee = 6 + Math.random() * 6;
    _0x235bbd.style.width = _0x4cfdee + "px";
    _0x235bbd.style.height = _0x4cfdee * 0.4 + "px";
    _0x235bbd.style.left = Math.random() * 100 + "vw";
    _0x235bbd.style.background = _0x18578f[_0x4328b7 % _0x18578f.length];
    _0x235bbd.style.setProperty("--rot", (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360) + "deg");
    _0x235bbd.style.animationDuration = 1.4 + Math.random() * 1.1 + "s";
    _0x235bbd.style.animationDelay = Math.random() * 0.25 + "s";
    document.body.appendChild(_0x235bbd);
    setTimeout(() => _0x235bbd.remove(), 3000);
  }
}
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const searchInput = document.getElementById("searchInput");
document.getElementById("year").textContent = new Date().getFullYear();
let searchDebounceTimer = null;
const searchClearBtn = document.getElementById("searchClearBtn");
const searchSuggestEl = document.getElementById("searchSuggest");
searchInput.addEventListener("input", () => {
  if (searchClearBtn) {
    searchClearBtn.classList.toggle("hidden", !searchInput.value);
  }
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    searchQuery = searchInput.value;
    renderProducts();
    renderSearchSuggestions(searchQuery);
  }, 180);
});
searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim()) {
    renderSearchSuggestions(searchInput.value);
  } else {
    renderTrendingSearches();
  }
});
if (searchClearBtn) {
  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    searchClearBtn.classList.add("hidden");
    renderProducts();
    hideSearchSuggestions();
    searchInput.focus();
  });
}
function hideSearchSuggestions() {
  if (searchSuggestEl) {
    searchSuggestEl.classList.add("hidden");
  }
}
function renderSearchSuggestions(_0x507c08) {
  if (!searchSuggestEl) {
    return;
  }
  const _0x25189d = (_0x507c08 || "").trim().toLowerCase();
  if (!_0x25189d) {
    hideSearchSuggestions();
    return;
  }
  const _0x428ba4 = PRODUCTS.filter(_0x21772b => (_0x21772b.name || "").toLowerCase().includes(_0x25189d) || (_0x21772b.category || "").toLowerCase().includes(_0x25189d) || (_0x21772b.description || "").toLowerCase().includes(_0x25189d));
  if (!_0x428ba4.length) {
    searchSuggestEl.innerHTML = "<p class=\"search-suggest-empty\">\"" + _0x25189d + "\" এর জন্য কোনো প্রোডাক্ট পাওয়া যায়নি</p>";
    searchSuggestEl.classList.remove("hidden");
    return;
  }
  const _0x2466e3 = _0x428ba4.slice(0, 6);
  searchSuggestEl.innerHTML = _0x2466e3.map(_0x41e158 => "\n    <div class=\"search-suggest-item\" data-id=\"" + _0x41e158.id + "\">\n      <img src=\"" + getFirstImage(_0x41e158) + "\" alt=\"" + _0x41e158.name + "\" " + imgFallbackAttr() + ">\n      <div class=\"search-suggest-info\">\n        <span class=\"search-suggest-name\">" + _0x41e158.name + "</span>\n        <span class=\"search-suggest-price\">" + formatTaka(_0x41e158.price) + "</span>\n      </div>\n    </div>\n  ").join("") + (_0x428ba4.length > _0x2466e3.length ? "<button type=\"button\" class=\"search-suggest-more\" id=\"searchSuggestMore\">সব " + _0x428ba4.length + "টি ফলাফল দেখুন</button>" : "");
  searchSuggestEl.querySelectorAll(".search-suggest-item").forEach(_0x5c70c4 => {
    _0x5c70c4.addEventListener("click", () => {
      hideSearchSuggestions();
      openModal(_0x5c70c4.dataset.id);
    });
  });
  const _0x3ca30c = document.getElementById("searchSuggestMore");
  if (_0x3ca30c) {
    _0x3ca30c.addEventListener("click", () => {
      hideSearchSuggestions();
      document.getElementById("products").scrollIntoView({
        behavior: "smooth"
      });
    });
  }
  searchSuggestEl.classList.remove("hidden");
}
document.addEventListener("click", _0x38939a => {
  if (!_0x38939a.target.closest(".search-wrap")) {
    hideSearchSuggestions();
  }
});
document.addEventListener("keydown", _0x50b0bc => {
  if (_0x50b0bc.key === "Escape") {
    hideSearchSuggestions();
  }
});
const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    sortOrder = sortSelect.value;
    renderProducts();
  });
}
const filterToggleBtn = document.getElementById("filterToggleBtn");
const filterPanel = document.getElementById("filterPanel");
if (filterToggleBtn && filterPanel) {
  filterToggleBtn.addEventListener("click", () => filterPanel.classList.toggle("open"));
}
const minPriceInput = document.getElementById("minPriceInput");
const maxPriceInput = document.getElementById("maxPriceInput");
const ratingFilterSelect = document.getElementById("ratingFilterSelect");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");
if (applyFilterBtn) {
  applyFilterBtn.addEventListener("click", () => {
    minPriceFilter = minPriceInput.value ? Number(minPriceInput.value) : null;
    maxPriceFilter = maxPriceInput.value ? Number(maxPriceInput.value) : null;
    minRatingFilter = ratingFilterSelect ? Number(ratingFilterSelect.value) : 0;
    renderProducts();
  });
}
if (clearFilterBtn) {
  clearFilterBtn.addEventListener("click", () => {
    if (minPriceInput) {
      minPriceInput.value = "";
    }
    if (maxPriceInput) {
      maxPriceInput.value = "";
    }
    if (ratingFilterSelect) {
      ratingFilterSelect.value = "0";
    }
    minPriceFilter = null;
    maxPriceFilter = null;
    minRatingFilter = 0;
    renderProducts();
  });
}
const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\"><rect width=\"200\" height=\"200\" fill=\"#eef3f0\"/><path d=\"M55 130l30-38 22 26 20-24 30 36H55z\" fill=\"#c7d6cf\"/><circle cx=\"75\" cy=\"75\" r=\"14\" fill=\"#c7d6cf\"/></svg>");
function formatTaka(_0x4618a6) {
  return "৳ " + _0x4618a6.toLocaleString("en-BD");
}
const DELIVERY_CHARGE = 150;
function saveCart() {
  localStorage.setItem("openshop_cart", JSON.stringify(cart));
  renderCartCount();
}
function getFirstImage(_0x15c1da) {
  if (_0x15c1da.images && _0x15c1da.images.length) {
    return _0x15c1da.images[0];
  } else {
    return _0x15c1da.image || PLACEHOLDER_IMG;
  }
}
function getAllImages(_0x477c70) {
  const _0xae9534 = _0x477c70.images && _0x477c70.images.length ? _0x477c70.images : _0x477c70.image ? [_0x477c70.image] : [];
  if (_0xae9534.length) {
    return _0xae9534;
  } else {
    return [PLACEHOLDER_IMG];
  }
}
function imgFallbackAttr() {
  return "onerror=\"this.onerror=null;this.src='" + PLACEHOLDER_IMG + "'\"";
}
function isOutOfStock(_0x41aeb0) {
  return _0x41aeb0.stock !== undefined && _0x41aeb0.stock !== null && _0x41aeb0.stock !== "" && Number(_0x41aeb0.stock) <= 0;
}
function isLowStock(_0x469100) {
  return _0x469100.stock !== undefined && _0x469100.stock !== null && _0x469100.stock !== "" && Number(_0x469100.stock) > 0 && Number(_0x469100.stock) <= 5;
}
function saveWishlist() {
  localStorage.setItem("openshop_wishlist", JSON.stringify(wishlist));
  renderWishlistCount();
}
function isWished(_0x3c962a) {
  return wishlist.includes(_0x3c962a);
}
function toggleWishlist(_0x14d0f5) {
  if (isWished(_0x14d0f5)) {
    wishlist = wishlist.filter(_0x26512e => _0x26512e !== _0x14d0f5);
  } else {
    wishlist.push(_0x14d0f5);
  }
  saveWishlist();
  const _0x2c3d14 = isWished(_0x14d0f5);
  document.querySelectorAll(".wish-heart[data-id=\"" + _0x14d0f5 + "\"]").forEach(_0x2690aa => {
    _0x2690aa.classList.toggle("active", _0x2c3d14);
    if (_0x2c3d14) {
      heartPopBurst(_0x2690aa);
    }
  });
}
function heartPopBurst(_0x4d276a) {
  _0x4d276a.classList.remove("pop");
  _0x4d276a.offsetWidth;
  _0x4d276a.classList.add("pop");
  const _0x1f3cc0 = _0x4d276a.getBoundingClientRect();
  const _0x3cff16 = _0x1f3cc0.left + _0x1f3cc0.width / 2;
  const _0x52f2d7 = _0x1f3cc0.top + _0x1f3cc0.height / 2;
  const _0x584428 = ["❤️", "💗", "✨"];
  for (let _0x5beb1e = 0; _0x5beb1e < 5; _0x5beb1e++) {
    const _0x124bad = document.createElement("span");
    _0x124bad.className = "heart-particle";
    _0x124bad.textContent = _0x584428[_0x5beb1e % _0x584428.length];
    _0x124bad.style.left = _0x3cff16 + "px";
    _0x124bad.style.top = _0x52f2d7 + "px";
    const _0x4df457 = (Math.random() * 100 - 50) * (Math.PI / 180);
    const _0x34f4a1 = 34 + Math.random() * 22;
    _0x124bad.style.setProperty("--hx", Math.sin(_0x4df457) * _0x34f4a1 + "px");
    _0x124bad.style.setProperty("--hy", -Math.cos(_0x4df457) * _0x34f4a1 - 20 + "px");
    _0x124bad.style.animationDelay = _0x5beb1e * 0.03 + "s";
    document.body.appendChild(_0x124bad);
    setTimeout(() => _0x124bad.remove(), 750);
  }
}
function renderWishlistCount() {
  const _0x522f91 = document.getElementById("wishlistCount");
  if (!_0x522f91) {
    return;
  }
  bumpBadge(_0x522f91, wishlist.length);
  _0x522f91.classList.toggle("hidden", wishlist.length === 0);
}
function heartSvg() {
  return "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 20s-7.5-4.6-9.8-9.1C.6 7.6 2 4 5.6 4c2 0 3.4 1.1 4.4 2.6C11 5.1 12.4 4 14.4 4 18 4 19.4 7.6 21.8 10.9 19.5 15.4 12 20 12 20z\"/></svg>";
}
function renderWishlistDrawer() {
  const _0x262f7a = document.getElementById("wishlistItems");
  if (!_0x262f7a) {
    return;
  }
  const _0xd545dd = wishlist.map(_0x4af582 => PRODUCTS.find(_0x20da39 => _0x20da39.id === _0x4af582)).filter(Boolean);
  if (_0xd545dd.length === 0) {
    _0x262f7a.innerHTML = "<div class=\"empty-cart\">আপনার পছন্দের তালিকা খালি<br>প্রোডাক্টের ❤️ আইকনে ক্লিক করে যোগ করুন</div>";
    return;
  }
  _0x262f7a.innerHTML = _0xd545dd.map(_0x4a7146 => "\n    <div class=\"cart-item\">\n      <img src=\"" + getFirstImage(_0x4a7146) + "\" alt=\"" + _0x4a7146.name + "\" " + imgFallbackAttr() + ">\n      <div class=\"cart-item-info\">\n        <h4>" + _0x4a7146.name + "</h4>\n        <div class=\"cart-item-meta\">" + formatTaka(_0x4a7146.price) + "</div>\n        <div class=\"qty-row\">\n          <button class=\"btn btn-primary\" data-openid=\"" + _0x4a7146.id + "\" style=\"padding:5px 12px; font-size:11px;\">দেখুন</button>\n          <button class=\"remove-btn\" data-removeid=\"" + _0x4a7146.id + "\">সরান</button>\n        </div>\n      </div>\n    </div>\n  ").join("");
  _0x262f7a.querySelectorAll("[data-openid]").forEach(_0x32b5d4 => _0x32b5d4.addEventListener("click", () => {
    closeWishlist();
    openModal(_0x32b5d4.dataset.openid);
  }));
  _0x262f7a.querySelectorAll("[data-removeid]").forEach(_0x25dc7c => _0x25dc7c.addEventListener("click", () => {
    toggleWishlist(_0x25dc7c.dataset.removeid);
    renderWishlistDrawer();
  }));
}
const wishlistDrawer = document.getElementById("wishlistDrawer");
const wishlistBtn = document.getElementById("wishlistBtn");
const wishlistClose = document.getElementById("wishlistClose");
function _wishlistDom() {
  wishlistDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  updateBodyScrollLock();
}
function openWishlist() {
  renderWishlistDrawer();
  wishlistDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  updateBodyScrollLock();
  layerOpen("wishlist", _wishlistDom);
}
function closeWishlist() {
  layerClose("wishlist", _wishlistDom);
}
if (wishlistBtn) {
  wishlistBtn.addEventListener("click", openWishlist);
}
if (wishlistClose) {
  wishlistClose.addEventListener("click", closeWishlist);
}
function applyDarkMode(_0xc869d3) {
  document.body.classList.toggle("dark-mode", _0xc869d3);
  const _0x2b0148 = document.getElementById("darkModeToggle");
  if (_0x2b0148) {
    _0x2b0148.classList.toggle("active", _0xc869d3);
  }
  localStorage.setItem("openshop_dark_mode", _0xc869d3 ? "1" : "0");
}
const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => applyDarkMode(!document.body.classList.contains("dark-mode")));
}
function renderCategories() {
  renderMainCategories();
  renderSubCategories();
}
function renderMainCategories() {
  const _0x24dfc3 = document.getElementById("mainCatPills");
  if (!_0x24dfc3) {
    return;
  }
  const _0x2ff443 = ["<button class=\"main-cat-card " + (activeMainCategory === "সব" ? "active" : "") + "\" data-main=\"সব\">\n       <span class=\"main-cat-icon\">🛍️</span><span class=\"main-cat-label\">সব</span>\n     </button>", ...MAIN_CATEGORIES.map(_0x276750 => "\n      <button class=\"main-cat-card " + (activeMainCategory === _0x276750.value ? "active" : "") + "\" data-main=\"" + _0x276750.value + "\">\n        <span class=\"main-cat-icon\">" + _0x276750.icon + "</span><span class=\"main-cat-label\">" + _0x276750.label + "</span>\n      </button>")];
  _0x24dfc3.innerHTML = _0x2ff443.join("");
  _0x24dfc3.querySelectorAll(".main-cat-card").forEach(_0x32995e => {
    _0x32995e.addEventListener("click", () => {
      activeMainCategory = _0x32995e.dataset.main;
      activeCategory = "সব";
      renderCategories();
      renderProducts();
    });
  });
}
function renderSubCategories() {
  const _0x213fba = document.getElementById("subCatWrap");
  const _0x5d6916 = document.getElementById("catPills");
  if (!_0x213fba || !_0x5d6916) {
    return;
  }
  if (activeMainCategory === "সব") {
    _0x213fba.classList.add("hidden");
    _0x5d6916.innerHTML = "";
    return;
  }
  const _0x5aeb63 = PRODUCTS.filter(_0x33633d => _0x33633d.mainCategory === activeMainCategory);
  const _0x2d5bb5 = [...new Set(_0x5aeb63.map(_0x53af4f => _0x53af4f.category).filter(Boolean))];
  if (_0x2d5bb5.length === 0) {
    _0x213fba.classList.add("hidden");
    _0x5d6916.innerHTML = "";
    return;
  }
  _0x213fba.classList.remove("hidden");
  _0x5d6916.innerHTML = _0x2d5bb5.map(_0x40a996 => "<button class=\"cat-pill " + (_0x40a996 === activeCategory ? "active" : "") + "\" data-cat=\"" + _0x40a996 + "\">" + _0x40a996 + "</button>").join("");
  _0x5d6916.querySelectorAll(".cat-pill").forEach(_0x1cfb48 => {
    _0x1cfb48.addEventListener("click", () => {
      activeCategory = _0x1cfb48.dataset.cat;
      renderSubCategories();
      renderProducts();
    });
  });
}
function sortProducts(_0x230b74) {
  const _0x4c5fab = [..._0x230b74];
  if (sortOrder === "price_asc") {
    _0x4c5fab.sort((_0x3f096, _0x28b691) => (_0x3f096.price || 0) - (_0x28b691.price || 0));
  } else if (sortOrder === "price_desc") {
    _0x4c5fab.sort((_0x345d1a, _0x515b4d) => (_0x515b4d.price || 0) - (_0x345d1a.price || 0));
  } else if (sortOrder === "name_asc") {
    _0x4c5fab.sort((_0x374da9, _0x10d1f1) => (_0x374da9.name || "").localeCompare(_0x10d1f1.name || "", "bn"));
  }
  return _0x4c5fab;
}
let heroSlideTimer = null;
let heroSlideIndex = 0;
function initHeroSlider() {
  const _0x2e9a64 = document.getElementById("heroSlider");
  const _0x2f3075 = document.getElementById("heroDots");
  if (!_0x2e9a64) {
    return;
  }
  _0x2e9a64.querySelectorAll(".hero-slide[data-generated]").forEach(_0x53e0e8 => _0x53e0e8.remove());
  const _0x34f8f8 = PRODUCTS.filter(_0x1673f5 => _0x1673f5.oldPrice && Number(_0x1673f5.oldPrice) > Number(_0x1673f5.price)).slice(0, 3);
  _0x34f8f8.forEach(_0x7b1ce5 => {
    const _0x2c142b = Math.round((1 - _0x7b1ce5.price / _0x7b1ce5.oldPrice) * 100);
    const _0x3f1eb3 = document.createElement("div");
    _0x3f1eb3.className = "hero-slide";
    _0x3f1eb3.setAttribute("data-generated", "1");
    _0x3f1eb3.innerHTML = "\n      <div class=\"hero-slide-bg\" style=\"background-image:url('" + getFirstImage(_0x7b1ce5) + "')\"></div>\n      <div class=\"hero-overlay\" aria-hidden=\"true\"></div>\n      <div class=\"container hero-inner\">\n        <p class=\"eyebrow\">🔥 সীমিত সময়ের অফার — " + _0x2c142b + "% ছাড়</p>\n        <h1>" + _0x7b1ce5.name + "</h1>\n        <p class=\"hero-desc\">এখন মাত্র " + formatTaka(_0x7b1ce5.price) + " <span style=\"text-decoration:line-through; opacity:.7; font-size:.85em;\">" + formatTaka(_0x7b1ce5.oldPrice) + "</span> — স্টক ফুরানোর আগেই অর্ডার করুন।</p>\n        <div class=\"hero-cta\">\n          <button type=\"button\" class=\"btn btn-primary hero-shop-btn\" data-pid=\"" + _0x7b1ce5.id + "\">এখনই দেখুন</button>\n          <a href=\"#products\" class=\"btn btn-ghost\">সব প্রোডাক্ট</a>\n        </div>\n      </div>\n    ";
    _0x2e9a64.appendChild(_0x3f1eb3);
  });
  const _0x1bc634 = _0x2e9a64.querySelectorAll(".hero-slide");
  clearInterval(heroSlideTimer);
  heroSlideTimer = null;
  heroSlideIndex = 0;
  if (_0x2f3075) {
    _0x2f3075.innerHTML = "";
  }
  _0x1bc634.forEach((_0x293acb, _0x57419c) => _0x293acb.classList.toggle("active", _0x57419c === 0));
  if (_0x1bc634.length <= 1) {
    if (_0x2f3075) {
      _0x2f3075.classList.add("hidden");
    }
    return;
  }
  _0x2e9a64.querySelectorAll(".hero-shop-btn").forEach(_0x4ec11d => {
    _0x4ec11d.addEventListener("click", _0x4ac790 => {
      _0x4ac790.preventDefault();
      openModal(_0x4ec11d.dataset.pid);
    });
  });
  if (_0x2f3075) {
    _0x2f3075.classList.remove("hidden");
    _0x2f3075.innerHTML = Array.from(_0x1bc634).map((_0x510794, _0x23b13e) => "<button type=\"button\" class=\"hero-dot " + (_0x23b13e === 0 ? "active" : "") + "\" data-idx=\"" + _0x23b13e + "\" aria-label=\"স্লাইড " + (_0x23b13e + 1) + "\"></button>").join("");
    _0x2f3075.querySelectorAll(".hero-dot").forEach(_0x19c7c8 => {
      _0x19c7c8.addEventListener("click", () => goToHeroSlide(Number(_0x19c7c8.dataset.idx)));
    });
  }
  heroSlideTimer = setInterval(() => goToHeroSlide((heroSlideIndex + 1) % _0x1bc634.length), 5000);
}
function goToHeroSlide(_0x1d3ded) {
  const _0x5e7c8c = document.getElementById("heroSlider");
  const _0x5e01fb = document.getElementById("heroDots");
  if (!_0x5e7c8c) {
    return;
  }
  const _0x1b43df = _0x5e7c8c.querySelectorAll(".hero-slide");
  if (!_0x1b43df.length) {
    return;
  }
  _0x1b43df.forEach((_0x523f75, _0x1f7187) => _0x523f75.classList.toggle("active", _0x1f7187 === _0x1d3ded));
  if (_0x5e01fb) {
    _0x5e01fb.querySelectorAll(".hero-dot").forEach((_0x3bd8f9, _0x3f3286) => _0x3bd8f9.classList.toggle("active", _0x3f3286 === _0x1d3ded));
  }
  heroSlideIndex = _0x1d3ded;
  if (heroSlideTimer) {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => goToHeroSlide((heroSlideIndex + 1) % _0x1b43df.length), 5000);
  }
}
/* ===== Flash Sale — অ্যাডমিন প্যানেল (ক্যাশ: settings/flash) থেকে নিয়ন্ত্রিত ===== */
let flashCountdownTimer = null;
let FLASH = null; // কখনো সেটআপ না করলে null — তখন আগের মতো "আজ রাত ১২টা" টাইমার চলবে
let flashEndHandled = false;
async function loadFlashConfig() {
  const _db = getDb();
  if (!_db) return;
  try {
    const _snap = await _db.collection("settings").doc("flash").get();
    FLASH = _snap.exists ? _snap.data() : null;
  } catch (_e) {
    console.warn("ফ্ল্যাশ সেল সেটিংস লোড করা যায়নি:", _e.message);
  }
}
function flashActive() {
  return !!(FLASH && FLASH.enabled && Number(FLASH.endAt) > Date.now());
}
function applyFlashPricing() {
  PRODUCTS.forEach(_p => {
    if (_p._origPrice !== undefined) {
      _p.price = _p._origPrice;
      _p.oldPrice = _p._origOld;
      delete _p._origPrice;
      delete _p._origOld;
      _p.isFlash = false;
    }
    if (flashActive() && _p.flash === true && Number(_p.flashPrice) > 0 && Number(_p.flashPrice) < Number(_p.price)) {
      _p._origPrice = _p.price;
      _p._origOld = _p.oldPrice;
      _p.oldPrice = _p.oldPrice && Number(_p.oldPrice) > Number(_p.price) ? _p.oldPrice : _p.price;
      _p.price = Number(_p.flashPrice);
      _p.isFlash = true;
    }
  });
}
// কার্টে আগে থেকে রাখা আইটেমের দাম বর্তমান দামের সাথে মিলিয়ে নেয় (সেল শেষ হলে পুরনো ফ্ল্যাশ দামে অর্ডার যাওয়া ঠেকাতে)
function syncCartPrices() {
  let _changed = false;
  cart.forEach(_it => {
    const _p = PRODUCTS.find(_x => _x.id === _it.id);
    if (_p && Number(_it.price) !== Number(_p.price)) {
      _it.price = _p.price;
      _changed = true;
    }
  });
  if (_changed) {
    saveCart();
  }
}
function flashFmt(_ms) {
  const _t = Math.max(0, Math.floor(_ms / 1000));
  const _pad = _n => String(_n).padStart(2, "0");
  return _pad(Math.floor(_t / 3600)) + ":" + _pad(Math.floor(_t % 3600 / 60)) + ":" + _pad(_t % 60);
}
function flashModalHtml(_p) {
  if (!_p || !_p.isFlash || !flashActive()) return "";
  return "<div class=\"flash-modal-strip\"><span>⚡ ফ্ল্যাশ সেল চলছে</span><span>শেষ হতে বাকি <b class=\"flash-timer-text\">" + flashFmt(Number(FLASH.endAt) - Date.now()) + "</b></span></div>";
}
function renderFlashSale() {
  const _fsSection = document.getElementById("flashSaleSection");
  const _fsScroll = document.getElementById("flashSaleScroll");
  if (!_fsSection || !_fsScroll) return;
  let _fsItems;
  if (FLASH) {
    _fsItems = flashActive() ? PRODUCTS.filter(_p => _p.isFlash).slice(0, 12) : [];
  } else {
    _fsItems = PRODUCTS.filter(_p => _p.oldPrice && Number(_p.oldPrice) > Number(_p.price))
      .sort((_a, _b) => (1 - _a.price / _a.oldPrice) < (1 - _b.price / _b.oldPrice) ? 1 : -1)
      .slice(0, 10);
  }
  if (!_fsItems.length) {
    _fsSection.classList.add("hidden");
    return;
  }
  _fsSection.classList.remove("hidden");
  const _h2 = _fsSection.querySelector("h2");
  if (_h2 && FLASH && FLASH.title) {
    _h2.textContent = "⚡ " + FLASH.title;
  }
  _fsScroll.innerHTML = _fsItems.map(_p => {
    const _disc = Math.round((1 - _p.price / _p.oldPrice) * 100);
    return "\n    <div class=\"flash-card\" data-id=\"" + _p.id + "\">\n      <span class=\"flash-badge\">-" + _disc + "%</span>\n      <img src=\"" + getFirstImage(_p) + "\" alt=\"" + _p.name + "\" loading=\"lazy\" " + imgFallbackAttr() + ">\n      <span class=\"flash-name\">" + _p.name + "</span>\n      <div class=\"flash-price-row\">\n        <span class=\"flash-price-now\">" + formatTaka(_p.price) + "</span>\n        <span class=\"flash-price-old\">" + formatTaka(_p.oldPrice) + "</span>\n      </div>\n    </div>\n  ";
  }).join("");
  _fsScroll.querySelectorAll(".flash-card").forEach(_card => {
    _card.addEventListener("click", () => openModal(_card.dataset.id));
  });
  startFlashCountdown();
}
function flashGlobalTick() {
  const _now = Date.now();
  // সময় শেষ হলে দাম আগের অবস্থায় ফেরত, সেকশন লুকানো
  if (FLASH && FLASH.enabled && !flashActive() && !flashEndHandled) {
    flashEndHandled = true;
    applyFlashPricing();
    syncCartPrices();
    renderProducts();
    renderCart();
    renderFlashSale();
    document.querySelectorAll(".flash-modal-strip").forEach(_el => { _el.textContent = "⌛ ফ্ল্যাশ সেল শেষ হয়েছে"; });
  }
  let _target;
  if (FLASH) {
    _target = flashActive() ? Number(FLASH.endAt) : _now;
  } else {
    const _m = new Date();
    _m.setHours(24, 0, 0, 0);
    _target = _m.getTime();
  }
  const _diff = Math.max(0, _target - _now);
  const _t = Math.floor(_diff / 1000);
  const _pad = _n => String(_n).padStart(2, "0");
  const _cdH = document.getElementById("cdHours");
  const _cdM = document.getElementById("cdMinutes");
  const _cdS = document.getElementById("cdSeconds");
  if (_cdH) _cdH.textContent = _pad(Math.floor(_t / 3600));
  if (_cdM) _cdM.textContent = _pad(Math.floor(_t % 3600 / 60));
  if (_cdS) _cdS.textContent = _pad(_t % 60);
  if (FLASH && flashActive()) {
    const _txt = flashFmt(_diff);
    document.querySelectorAll(".flash-timer-text").forEach(_el => { _el.textContent = _txt; });
  }
}
function startFlashCountdown() {
  if (flashCountdownTimer) return;
  flashGlobalTick();
  flashCountdownTimer = setInterval(flashGlobalTick, 1000);
}

/* ===== Voucher strip (Daraz-style coupon carousel on homepage) ===== */
function renderVoucherStrip() {
  const _vsSection = document.getElementById("voucherStripSection");
  const _vsScroll = document.getElementById("voucherStripScroll");
  if (!_vsSection || !_vsScroll) return;
  if (!COUPONS || !COUPONS.length) {
    _vsSection.classList.add("hidden");
    return;
  }
  const _today = new Date().toISOString().slice(0, 10);
  const _active = COUPONS.filter(_c => _c.active !== false && (!_c.expiry || _c.expiry >= _today)).slice(0, 8);
  if (!_active.length) {
    _vsSection.classList.add("hidden");
    return;
  }
  _vsSection.classList.remove("hidden");
  _vsScroll.innerHTML = _active.map(_c => {
    const _valueText = _c.type === "free_delivery" ? "ফ্রি\nডেলিভারি" : _c.type === "fixed" ? formatTaka(_c.value) : _c.value + "%";
    const _hasProduct = !!_c.productId && PRODUCTS.some(_p => _p.id === _c.productId);
    return "\n    <div class=\"voucher-card" + (_hasProduct ? " voucher-card-clickable" : "") + "\" " + (_hasProduct ? "data-pid=\"" + _c.productId + "\" role=\"button\" tabindex=\"0\"" : "") + " title=\"" + (_hasProduct ? "প্রোডাক্টটি দেখতে ট্যাপ করুন" : "") + "\">\n      <div class=\"voucher-card-value\">" + _valueText + " ছাড়</div>\n      <div class=\"voucher-card-body\">\n        <span class=\"voucher-card-label\">" + (_c.label || "বিশেষ অফার") + "</span>\n        " + (_c.minOrder ? "<span class=\"voucher-card-min\">সর্বনিম্ন " + formatTaka(_c.minOrder) + "</span>" : "") + "\n        <button type=\"button\" class=\"voucher-card-copy\" data-code=\"" + _c.code + "\">কোড: " + _c.code + " (কপি করুন)</button>\n      </div>\n    </div>\n  ";
  }).join("");
  _vsScroll.querySelectorAll(".voucher-card-copy").forEach(_btn => {
    _btn.addEventListener("click", _evt => {
      _evt.stopPropagation();
      const _code = _btn.dataset.code;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(_code).catch(() => {});
      }
      showSiteToast("কুপন কোড \"" + _code + "\" কপি হয়েছে", "🏷️");
    });
  });
  _vsScroll.querySelectorAll(".voucher-card-clickable").forEach(_card => {
    _card.addEventListener("click", () => openModal(_card.dataset.pid));
    _card.addEventListener("keydown", _evt => {
      if (_evt.key === "Enter" || _evt.key === " ") {
        _evt.preventDefault();
        openModal(_card.dataset.pid);
      }
    });
  });
}

/* ===== Recently viewed products ===== */
function trackRecentlyViewed(_id) {
  try {
    let _list = JSON.parse(localStorage.getItem("openshop_recent") || "[]");
    _list = _list.filter(_x => _x !== _id);
    _list.unshift(_id);
    _list = _list.slice(0, 12);
    localStorage.setItem("openshop_recent", JSON.stringify(_list));
  } catch (_e) {}
}
function renderRecentlyViewed() {
  const _rvSection = document.getElementById("recentlyViewedSection");
  const _rvScroll = document.getElementById("recentlyViewedScroll");
  if (!_rvSection || !_rvScroll) return;
  let _list = [];
  try {
    _list = JSON.parse(localStorage.getItem("openshop_recent") || "[]");
  } catch (_e) {}
  const _items = _list.map(_id => PRODUCTS.find(_p => _p.id === _id)).filter(Boolean).slice(0, 10);
  if (!_items.length) {
    _rvSection.classList.add("hidden");
    return;
  }
  _rvSection.classList.remove("hidden");
  _rvScroll.innerHTML = _items.map(_p => "\n    <div class=\"related-card\" data-relid=\"" + _p.id + "\">\n      <img src=\"" + getFirstImage(_p) + "\" alt=\"" + _p.name + "\" loading=\"lazy\" " + imgFallbackAttr() + ">\n      <span class=\"r-name\">" + _p.name + "</span>\n      <span class=\"r-price\">" + formatTaka(_p.price) + "</span>\n    </div>\n  ").join("");
  _rvScroll.querySelectorAll(".related-card").forEach(_card => {
    _card.addEventListener("click", () => openModal(_card.dataset.relid));
  });
}

/* ===== Search trending chips (shown when search box is focused & empty) ===== */
const TRENDING_SEARCHES = ["শাড়ি", "পাঞ্জাবি", "জুতা", "মোবাইল এক্সেসরিজ", "হোম ডেকর", "কসমেটিক্স"];
function renderTrendingSearches() {
  if (!searchSuggestEl) return;
  const _today = new Date().toISOString().slice(0, 10);
  const _productChips = (COUPONS || [])
    .filter(_c => _c.productId && _c.active !== false && (!_c.expiry || _c.expiry >= _today))
    .map(_c => ({ c: _c, p: PRODUCTS.find(_p => _p.id === _c.productId) }))
    .filter(_x => !!_x.p)
    .slice(0, 4);
  const _termChips = TRENDING_SEARCHES.slice(0, Math.max(3, 6 - _productChips.length));
  const _productChipsHtml = _productChips.map(_x => "<button type=\"button\" class=\"search-trending-chip search-trending-chip-product\" data-pid=\"" + _x.p.id + "\" title=\"" + _x.p.name + " — এই প্রোডাক্টে অফার আছে\">🏷️ " + _x.p.name + "</button>").join("");
  const _termChipsHtml = _termChips.map(_t => "<button type=\"button\" class=\"search-trending-chip\" data-term=\"" + _t + "\">" + _t + "</button>").join("");
  searchSuggestEl.innerHTML = "<p class=\"search-trending-title\">🔥 জনপ্রিয় সার্চ</p><div class=\"search-trending-chips\">" + _productChipsHtml + _termChipsHtml + "</div>";
  searchSuggestEl.querySelectorAll(".search-trending-chip-product").forEach(_chip => {
    _chip.addEventListener("click", () => {
      hideSearchSuggestions();
      openModal(_chip.dataset.pid);
    });
  });
  searchSuggestEl.querySelectorAll(".search-trending-chip").forEach(_chip => {
    if (_chip.classList.contains("search-trending-chip-product")) return;
    _chip.addEventListener("click", () => {
      searchInput.value = _chip.dataset.term;
      searchQuery = _chip.dataset.term;
      if (searchClearBtn) searchClearBtn.classList.remove("hidden");
      renderProducts();
      hideSearchSuggestions();
      document.getElementById("products").scrollIntoView({
        behavior: "smooth"
      });
    });
  });
  searchSuggestEl.classList.remove("hidden");
}

function brandTagHtml(_p) {
  return _p.brand ? "<span class=\"brand-tag\">" + _p.brand + "</span>" : "";
}
function freeDeliveryBadgeHtml(_p) {
  return _p.freeDelivery ? "<span class=\"free-delivery-tag\">🚚 ফ্রি ডেলিভারি</span>" : "";
}
function renderProducts() {
  let _0x3ca87b = PRODUCTS;
  if (activeMainCategory !== "সব") {
    _0x3ca87b = _0x3ca87b.filter(_0x180e9d => _0x180e9d.mainCategory === activeMainCategory);
  }
  if (activeCategory !== "সব") {
    _0x3ca87b = _0x3ca87b.filter(_0x13fc9e => _0x13fc9e.category === activeCategory);
  }
  if (searchQuery.trim()) {
    const _0x3de9c5 = searchQuery.trim().toLowerCase();
    _0x3ca87b = _0x3ca87b.filter(_0x34a060 => (_0x34a060.name || "").toLowerCase().includes(_0x3de9c5) || (_0x34a060.category || "").toLowerCase().includes(_0x3de9c5) || (_0x34a060.description || "").toLowerCase().includes(_0x3de9c5));
  }
  if (minPriceFilter !== null) {
    _0x3ca87b = _0x3ca87b.filter(_0x1e0b5f => (_0x1e0b5f.price || 0) >= minPriceFilter);
  }
  if (maxPriceFilter !== null) {
    _0x3ca87b = _0x3ca87b.filter(_0xf8a94 => (_0xf8a94.price || 0) <= maxPriceFilter);
  }
  if (minRatingFilter > 0) {
    _0x3ca87b = _0x3ca87b.filter(_0x311dfe => getProductRating(_0x311dfe.id).avg >= minRatingFilter);
  }
  _0x3ca87b = sortProducts(_0x3ca87b);
  const _0x499c93 = document.getElementById("emptyState");
  if (_0x3ca87b.length === 0) {
    productGrid.innerHTML = "";
    if (_0x499c93) {
      _0x499c93.classList.remove("hidden");
    }
    return;
  }
  if (_0x499c93) {
    _0x499c93.classList.add("hidden");
  }
  productGrid.innerHTML = _0x3ca87b.map(_0x35a1aa => {
    const _0x5ca910 = getAllImages(_0x35a1aa);
    const _0x4202ef = _0x5ca910.length > 1;
    const _0x48ca62 = isOutOfStock(_0x35a1aa);
    return "\n    <div class=\"product-card\" data-id=\"" + _0x35a1aa.id + "\">\n      <div class=\"product-thumb\">\n        " + (_0x35a1aa.oldPrice ? "<span class=\"product-badge\">-" + Math.round((1 - _0x35a1aa.price / _0x35a1aa.oldPrice) * 100) + (_0x35a1aa.isFlash ? "% ⚡ ফ্ল্যাশ" : "% অফার") + "</span>" : "") + "\n        <button class=\"wish-heart " + (isWished(_0x35a1aa.id) ? "active" : "") + "\" data-id=\"" + _0x35a1aa.id + "\" aria-label=\"পছন্দের তালিকায় যোগ করুন\">" + heartSvg() + "</button>\n        <img src=\"" + _0x5ca910[0] + "\" alt=\"" + _0x35a1aa.name + "\" loading=\"lazy\" " + imgFallbackAttr() + ">\n        " + (_0x4202ef ? "<img src=\"" + _0x5ca910[1] + "\" alt=\"" + _0x35a1aa.name + " আরও ছবি\" class=\"thumb-img-alt\" loading=\"lazy\" " + imgFallbackAttr() + ">" : "") + "\n        " + (_0x4202ef ? "\n          <span class=\"photo-count-badge\">\n            <svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M4 5h2l1.5-2h9L18 5h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z\"/></svg>\n            " + _0x5ca910.length + "\n          </span>" : "") + "\n        " + (_0x48ca62 ? "<div class=\"stock-badge\">স্টকে নেই</div>" : "") + "\n        " + (_0x35a1aa.freeDelivery ? "<span class=\"free-delivery-corner\">🚚 ফ্রি</span>" : "") + "\n      </div>\n      <div class=\"product-body\">\n        <span class=\"product-cat\">" + _0x35a1aa.category + "</span>" + brandTagHtml(_0x35a1aa) + "\n        <div class=\"product-name-row\">\n          <span class=\"product-name\">" + _0x35a1aa.name + "</span>\n          <button type=\"button\" class=\"review-tag\" data-id=\"" + _0x35a1aa.id + "\">✍️ রিভিউ দিন</button>\n        </div>\n        " + ratingBadgeHtml(_0x35a1aa.id) + "\n        <div class=\"product-price\">\n          <span class=\"price-now\">" + formatTaka(_0x35a1aa.price) + "</span>\n          " + (_0x35a1aa.oldPrice ? "<span class=\"price-old\">" + formatTaka(_0x35a1aa.oldPrice) + "</span>" : "") + "\n        </div>\n        " + (isLowStock(_0x35a1aa) ? "<span class=\"low-stock-note\">মাত্র " + _0x35a1aa.stock + "টি বাকি আছে!</span>" : "") + "\n        " + couponChipHtml(_0x35a1aa.id) + "\n        <div class=\"card-actions\">\n          <button class=\"buy-now-btn " + (_0x48ca62 ? "out-of-stock" : "") + "\" data-id=\"" + _0x35a1aa.id + "\" " + (_0x48ca62 ? "disabled" : "") + ">" + (_0x48ca62 ? "স্টকে নেই" : "এখনই কিনুন") + "</button>\n          <button class=\"add-btn " + (_0x48ca62 ? "out-of-stock" : "") + "\" data-id=\"" + _0x35a1aa.id + "\" " + (_0x48ca62 ? "disabled" : "") + ">" + (_0x48ca62 ? "স্টকে নেই" : "কার্টে যোগ") + "</button>\n        </div>\n      </div>\n    </div>\n  ";
  }).join("");
  markReveal(productGrid.querySelectorAll(".product-card"), 0.05);
  productGrid.querySelectorAll(".product-thumb, .product-name").forEach(_0x5a3fa6 => {
    _0x5a3fa6.addEventListener("click", _0x2d3c7a => {
      if (_0x2d3c7a.target.closest(".wish-heart")) {
        return;
      }
      const _0x175c60 = _0x2d3c7a.target.closest(".product-card").dataset.id;
      openModal(_0x175c60);
    });
  });
  productGrid.querySelectorAll(".review-tag").forEach(_0x158931 => {
    _0x158931.addEventListener("click", _0x5aa9dc => {
      _0x5aa9dc.stopPropagation();
      openModal(_0x158931.dataset.id, {
        scrollToReview: true
      });
    });
  });
  productGrid.querySelectorAll(".coupon-copy-btn").forEach(_0x49a21d => {
    _0x49a21d.addEventListener("click", _0x4973f0 => {
      _0x4973f0.stopPropagation();
      applyProductCouponFromChip(_0x49a21d.dataset.code, _0x49a21d.dataset.pid, _0x49a21d);
    });
  });
  productGrid.querySelectorAll(".add-btn").forEach(_0x352ddd => {
    _0x352ddd.addEventListener("click", _0x413a38 => {
      _0x413a38.stopPropagation();
      if (_0x352ddd.disabled) {
        return;
      }
      const _0x25b3a9 = _0x352ddd.closest(".product-card").querySelector(".product-thumb img");
      flyToCart(_0x25b3a9);
      addToCart(_0x352ddd.dataset.id, null, 1);
    });
  });
  productGrid.querySelectorAll(".buy-now-btn").forEach(_0x47085c => {
    _0x47085c.addEventListener("click", _0x134dcd => {
      _0x134dcd.stopPropagation();
      if (_0x47085c.disabled) {
        return;
      }
      const _0x365236 = _0x47085c.closest(".product-card").querySelector(".product-thumb img");
      flyToCart(_0x365236);
      addToCart(_0x47085c.dataset.id, null, 1);
      openCart();
    });
  });
  productGrid.querySelectorAll(".wish-heart").forEach(_0x56db1b => {
    _0x56db1b.addEventListener("click", _0x1523d0 => {
      _0x1523d0.stopPropagation();
      toggleWishlist(_0x56db1b.dataset.id);
    });
  });
}
function shareSvg() {
  return "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"18\" cy=\"5\" r=\"2.5\"/><circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"19\" r=\"2.5\"/><path d=\"M8.2 10.7 15.8 6.3M8.2 13.3l7.6 4.4\"/></svg>";
}
function waSvg() {
  return "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.12-.42-.14-.96-.32-1.65-.62-2.9-1.25-4.8-4.16-4.94-4.35-.15-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.62 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.13.07.72-.17 1.39z\"/></svg>";
}
function relatedProductsHtml(_0x51021a) {
  const _0x1c891a = PRODUCTS.filter(_0x143fc1 => _0x143fc1.id !== _0x51021a.id && _0x143fc1.category === _0x51021a.category).slice(0, 6);
  if (_0x1c891a.length === 0) {
    return "";
  }
  return "\n    <div class=\"related-products\">\n      <h3>এগুলোও দেখতে পারেন</h3>\n      <div class=\"related-grid\">\n        " + _0x1c891a.map(_0x23fe53 => "\n          <div class=\"related-card\" data-relid=\"" + _0x23fe53.id + "\">\n            <img src=\"" + getFirstImage(_0x23fe53) + "\" alt=\"" + _0x23fe53.name + "\" loading=\"lazy\" " + imgFallbackAttr() + ">\n            <span class=\"r-name\">" + _0x23fe53.name + "</span>\n            <span class=\"r-price\">" + formatTaka(_0x23fe53.price) + "</span>\n          </div>\n        ").join("") + "\n      </div>\n    </div>\n  ";
}
function reviewCardHtml(_0x557f98) {
  const _0xbdf206 = _0x557f98.ts ? new Date(_0x557f98.ts).toLocaleDateString("bn-BD") : "";
  return "\n    <div class=\"review-card\">\n      <div class=\"review-card-head\">\n        <b>" + (_0x557f98.name || "যাচাইকৃত ক্রেতা").replace(/</g, "&lt;") + "</b>\n        <span class=\"stars-mini\">" + starsHtml(_0x557f98.rating) + "</span>\n      </div>\n      " + (_0x557f98.comment ? "<p>" + _0x557f98.comment.replace(/</g, "&lt;") + "</p>" : "") + "\n      <span class=\"review-date\">" + _0xbdf206 + "</span>\n    </div>";
}
function reviewsSectionHtml(_0x46f5c7) {
  const _0x220735 = REVIEWS.filter(_0x411f8c => _0x411f8c.productId === _0x46f5c7.id);
  const {
    avg: _0x2c9fe8,
    count: _0x55a236
  } = getProductRating(_0x46f5c7.id);
  return "\n    <div class=\"reviews-section\">\n      <h3>কাস্টমার রিভিউ " + (_0x55a236 ? "(" + _0x2c9fe8.toFixed(1) + " ★ — " + _0x55a236 + "টি রিভিউ)" : "") + "</h3>\n      <div class=\"reviews-list\" id=\"reviewsList\">\n        " + (_0x55a236 ? _0x220735.map(reviewCardHtml).join("") : "<p class=\"reviews-empty\">এখনো কোনো রিভিউ নেই — প্রথম রিভিউটা আপনিই দিন!</p>") + "\n      </div>\n      <div class=\"review-form\">\n        <strong style=\"font-size:13px;\">আপনার রিভিউ দিন</strong>\n        <div class=\"star-picker\" id=\"starPicker\" data-value=\"0\">\n          " + [1, 2, 3, 4, 5].map(_0x4e8edb => "<span class=\"star-pick\" data-star=\"" + _0x4e8edb + "\">★</span>").join("") + "\n        </div>\n        <input type=\"text\" id=\"reviewName\" placeholder=\"আপনার নাম (ঐচ্ছিক)\" class=\"lead-input\">\n        <textarea id=\"reviewComment\" placeholder=\"প্রোডাক্ট নিয়ে আপনার মতামত লিখুন (ঐচ্ছিক)\"></textarea>\n        <button type=\"button\" class=\"btn btn-outline\" id=\"submitReviewBtn\" data-pid=\"" + _0x46f5c7.id + "\">রিভিউ জমা দিন</button>\n        <p class=\"msg\" id=\"reviewMsg\"></p>\n      </div>\n    </div>";
}
async function submitReview(_0x41b295) {
  const _0x3bafe0 = document.getElementById("reviewMsg");
  const _0x126b40 = document.getElementById("starPicker");
  const _0x3717df = Number(_0x126b40 ? _0x126b40.dataset.value : 0);
  if (!_0x3717df) {
    _0x3bafe0.textContent = "অনুগ্রহ করে একটা রেটিং (স্টার) বাছাই করুন।";
    _0x3bafe0.className = "msg error";
    return;
  }
  const _0x43b315 = document.getElementById("reviewName").value.trim();
  const _0x5ec521 = document.getElementById("reviewComment").value.trim();
  const _0x1a551c = getDb();
  if (!_0x1a551c) {
    _0x3bafe0.textContent = "রিভিউ সিস্টেম এখন উপলব্ধ নয়।";
    _0x3bafe0.className = "msg error";
    return;
  }
  const _0x232548 = document.getElementById("submitReviewBtn");
  _0x232548.disabled = true;
  _0x232548.textContent = "জমা হচ্ছে...";
  try {
    const _0x595837 = {
      productId: _0x41b295,
      name: _0x43b315 || null,
      rating: _0x3717df,
      comment: _0x5ec521 || null,
      ts: Date.now(),
      day: new Date().toISOString().slice(0, 10)
    };
    await _0x1a551c.collection("reviews").add(_0x595837);
    REVIEWS.unshift({
      id: "local-" + Date.now(),
      ..._0x595837
    });
    _0x3bafe0.textContent = "ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।";
    _0x3bafe0.className = "msg ok";
    renderProducts();
    const _0x36f1b8 = PRODUCTS.find(_0x302893 => _0x302893.id === _0x41b295);
    if (_0x36f1b8) {
      openModal(_0x41b295);
    }
  } catch (_0x5e76c8) {
    _0x3bafe0.textContent = "রিভিউ জমা করা যায়নি: " + _0x5e76c8.message;
    _0x3bafe0.className = "msg error";
    _0x232548.disabled = false;
    _0x232548.textContent = "রিভিউ জমা দিন";
  }
}
function openModal(_0x5af9cc, _0x1b0636) {
  _0x1b0636 = _0x1b0636 || {};
  const _0xdbfbc6 = PRODUCTS.find(_0x6e352b => _0x6e352b.id === _0x5af9cc);
  if (!_0xdbfbc6) {
    return;
  }
  logEvent("product_view", {
    productId: _0x5af9cc,
    productName: _0xdbfbc6.name
  });
  trackRecentlyViewed(_0x5af9cc);
  if (_0x1b0636.updateUrl !== false) {
    const _0x52db0c = "#product-" + _0x5af9cc;
    if (window.location.hash !== _0x52db0c) {
      const _0xalreadyOpen = (window.location.hash || "").startsWith("#product-");
      const _0xhistArgs = [{
        productId: _0x5af9cc
      }, "", window.location.pathname + window.location.search + _0x52db0c];
      histRun(function () {
      if (_0xalreadyOpen) {
        // মডাল খোলা অবস্থায় রিলেটেড প্রোডাক্টে গেলে নতুন হিস্ট্রি এন্ট্রি যোগ না করে বিদ্যমানটাই বদলে দেওয়া হচ্ছে,
        // যাতে ক্লোজ বাটনে একবার চাপলেই সম্পূর্ণ বন্ধ হয়ে যায়।
        history.replaceState(..._0xhistArgs);
      } else {
        history.pushState(..._0xhistArgs);
      }
      });
    }
  }
  selectedSize = _0xdbfbc6.sizes && _0xdbfbc6.sizes.length ? _0xdbfbc6.sizes[0] : null;
  const _0x3175cd = getAllImages(_0xdbfbc6);
  selectedImage = _0x3175cd[0];
  const _0x67b6c6 = isOutOfStock(_0xdbfbc6);
  modalContent.innerHTML = "\n    <div class=\"modal-content-inner\">\n    <div class=\"modal-gallery\">\n      <img src=\"" + _0x3175cd[0] + "\" alt=\"" + _0xdbfbc6.name + "\" id=\"modalMainImg\" " + imgFallbackAttr() + ">\n      " + (_0x3175cd.length > 1 ? "\n        <p class=\"modal-thumbs-hint\">যেই ছবিটা অর্ডার করবেন সেটাতে ট্যাপ করে বাছাই করুন:</p>\n        <div class=\"modal-thumbs\">\n          " + _0x3175cd.map((_0x4627b7, _0x12e3fd) => "<img src=\"" + _0x4627b7 + "\" class=\"" + (_0x12e3fd === 0 ? "active" : "") + "\" data-idx=\"" + _0x12e3fd + "\" alt=\"" + _0xdbfbc6.name + " ছবি " + (_0x12e3fd + 1) + "\" " + imgFallbackAttr() + ">").join("") + "\n        </div>" : "") + "\n    </div>\n    <div class=\"modal-info\">\n      <div style=\"display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;\">\n        <span class=\"product-cat\">" + _0xdbfbc6.category + "</span>" + brandTagHtml(_0xdbfbc6) + "\n        <div style=\"display:flex; gap:8px;\">\n          <button class=\"wish-heart " + (isWished(_0xdbfbc6.id) ? "active" : "") + "\" id=\"modalWishBtn\" data-id=\"" + _0xdbfbc6.id + "\">" + heartSvg() + " <span>পছন্দে যোগ করুন</span></button>\n        </div>\n      </div>\n      <h2>" + _0xdbfbc6.name + "</h2>\n      " + ratingBadgeHtml(_0xdbfbc6.id) + "\n      <div class=\"modal-action-row\">\n        <button class=\"share-btn\" id=\"modalShareBtn\">" + shareSvg() + " শেয়ার করুন</button>\n        " + likeButtonHtml(_0xdbfbc6.id) + "\n      </div>\n      <p class=\"modal-desc\">" + (_0xdbfbc6.description || "") + "</p>" + flashModalHtml(_0xdbfbc6) + "\n      <div class=\"product-price\">\n        <span class=\"price-now\">" + formatTaka(_0xdbfbc6.price) + "</span>\n        " + (_0xdbfbc6.oldPrice ? "<span class=\"price-old\">" + formatTaka(_0xdbfbc6.oldPrice) + "</span>" : "") + "\n      </div>\n      " + freeDeliveryBadgeHtml(_0xdbfbc6) + "\n      " + (_0x67b6c6 ? "<p style=\"color:var(--coral); font-weight:700; font-size:13px;\">এই প্রোডাক্টটি বর্তমানে স্টকে নেই।</p>" : "") + "\n      " + (isLowStock(_0xdbfbc6) ? "<p class=\"low-stock-note\">মাত্র " + _0xdbfbc6.stock + "টি বাকি আছে!</p>" : "") + "\n      " + couponChipHtml(_0xdbfbc6.id) + "\n      " + (_0xdbfbc6.sizes && _0xdbfbc6.sizes.length ? "\n        <div>\n          <strong style=\"font-size:13px;\">ভ্যারিয়েন্ট বাছাই করুন:</strong>\n          <div class=\"size-row\" id=\"sizeRow\">\n            " + _0xdbfbc6.sizes.map((_0x3514d8, _0x340088) => "<span class=\"size-chip " + (_0x340088 === 0 ? "selected" : "") + "\" data-size=\"" + _0x3514d8 + "\">" + _0x3514d8 + "</span>").join("") + "\n          </div>\n        </div>" : "") + "\n      <button class=\"buy-now-btn modal-buy-now-btn btn-block\" id=\"modalBuyNowBtn\" " + (_0x67b6c6 ? "disabled" : "") + " style=\"width:100%; padding:13px;\">" + (_0x67b6c6 ? "স্টকে নেই" : "এখনই কিনুন") + "</button>\n      <button class=\"btn btn-primary btn-block\" id=\"modalAddBtn\" " + (_0x67b6c6 ? "disabled" : "") + " style=\"margin-top:8px;\">" + (_0x67b6c6 ? "স্টকে নেই" : "কার্টে যোগ করুন") + "</button>\n    </div>\n    </div>\n    " + relatedProductsHtml(_0xdbfbc6) + "\n    " + reviewsSectionHtml(_0xdbfbc6) + "\n  ";
  productModal.classList.add("open");
  updateBodyScrollLock();
  const _0x3f0864 = document.getElementById("modalMainImg");
  document.querySelectorAll(".modal-thumbs img").forEach(_0x453876 => {
    _0x453876.addEventListener("click", () => {
      _0x3f0864.src = _0x453876.src;
      selectedImage = _0x3175cd[Number(_0x453876.dataset.idx)] || _0x453876.src;
      document.querySelectorAll(".modal-thumbs img").forEach(_0x1b2c19 => _0x1b2c19.classList.remove("active"));
      _0x453876.classList.add("active");
    });
  });
  const _0x279eff = document.getElementById("sizeRow");
  if (_0x279eff) {
    _0x279eff.querySelectorAll(".size-chip").forEach(_0x3484b5 => {
      _0x3484b5.addEventListener("click", () => {
        _0x279eff.querySelectorAll(".size-chip").forEach(_0x4512b8 => _0x4512b8.classList.remove("selected"));
        _0x3484b5.classList.add("selected");
        selectedSize = _0x3484b5.dataset.size;
      });
    });
  }
  const _0x4156cd = document.getElementById("modalAddBtn");
  if (_0x4156cd) {
    _0x4156cd.addEventListener("click", () => {
      if (_0x4156cd.disabled) {
        return;
      }
      flyToCart(document.getElementById("modalMainImg"));
      addToCart(_0x5af9cc, selectedSize, 1, selectedImage);
      showSiteToast("কার্টে যোগ করা হয়েছে ✅");
    });
  }
  const _0x17d122 = document.getElementById("modalBuyNowBtn");
  if (_0x17d122) {
    _0x17d122.addEventListener("click", () => {
      if (_0x17d122.disabled) {
        return;
      }
      flyToCart(document.getElementById("modalMainImg"));
      addToCart(_0x5af9cc, selectedSize, 1, selectedImage);
      closeModal();
      openCart();
    });
  }
  const _0x2f2524 = document.getElementById("modalWishBtn");
  modalContent.querySelectorAll(".coupon-copy-btn").forEach(_0x30303c => {
    _0x30303c.addEventListener("click", () => applyProductCouponFromChip(_0x30303c.dataset.code, _0x30303c.dataset.pid, _0x30303c));
  });
  if (_0x2f2524) {
    _0x2f2524.addEventListener("click", () => {
      toggleWishlist(_0x5af9cc);
      _0x2f2524.classList.toggle("active", isWished(_0x5af9cc));
    });
  }
  const _0x4ea94a = document.getElementById("modalShareBtn");
  if (_0x4ea94a) {
    _0x4ea94a.addEventListener("click", async () => {
      const _0x407205 = window.location.origin + window.location.pathname + "#product-" + _0x5af9cc;
      const _0x505663 = {
        title: _0xdbfbc6.name,
        text: _0xdbfbc6.name + " — " + formatTaka(_0xdbfbc6.price) + " — Openshop-এ দেখুন",
        url: _0x407205
      };
      if (navigator.share) {
        try {
          await navigator.share(_0x505663);
        } catch (_0xeed6dd) {}
      } else {
        try {
          await navigator.clipboard.writeText(_0x407205);
          showSiteToast("লিংক কপি হয়েছে!");
        } catch (_0x25f06c) {
          showSiteToast("লিংক কপি করা যায়নি।");
        }
      }
    });
  }
  const _0x7f58ff = modalContent.querySelector(".like-btn[data-id=\"" + _0x5af9cc + "\"]");
  if (_0x7f58ff) {
    _0x7f58ff.addEventListener("click", () => likeProduct(_0x5af9cc));
  }
  modalContent.querySelectorAll(".related-card").forEach(_0x24f5d9 => {
    _0x24f5d9.addEventListener("click", () => openModal(_0x24f5d9.dataset.relid));
  });
  const _0x4bc7e2 = document.getElementById("starPicker");
  if (_0x4bc7e2) {
    const _0x11f765 = _0x32bed3 => {
      _0x4bc7e2.querySelectorAll(".star-pick").forEach(_0x10a869 => _0x10a869.classList.toggle("selected", Number(_0x10a869.dataset.star) <= _0x32bed3));
    };
    _0x4bc7e2.querySelectorAll(".star-pick").forEach(_0x4a93ae => {
      _0x4a93ae.addEventListener("click", () => {
        _0x4bc7e2.dataset.value = _0x4a93ae.dataset.star;
        _0x11f765(Number(_0x4a93ae.dataset.star));
      });
    });
  }
  const _0x112488 = document.getElementById("submitReviewBtn");
  if (_0x112488) {
    _0x112488.addEventListener("click", () => submitReview(_0x112488.dataset.pid));
  }
  if (_0x1b0636.scrollToReview) {
    const _0x378035 = modalContent.querySelector(".review-form");
    if (_0x378035) {
      requestAnimationFrame(() => {
        _0x378035.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  }
}
function updateBodyScrollLock() {
  const _0x2322fe = [productModal, orderConfirmModal, cartDrawer, profileDrawer, document.getElementById("couponsModal")].some(_0x279087 => _0x279087 && _0x279087.classList.contains("open"));
  document.body.style.overflow = _0x2322fe ? "hidden" : "";
}
function closeModal() {
  if ((window.location.hash || "").startsWith("#product-")) {
    histBack("product");
  } else {
    productModal.classList.remove("open");
    updateBodyScrollLock();
  }
}
modalClose.addEventListener("click", closeModal);
productModal.addEventListener("click", _0x661537 => {
  if (_0x661537.target === productModal) {
    closeModal();
  }
});
function getStockLimit(_p) {
  if (!_p || _p.stock === undefined || _p.stock === null || _p.stock === "") {
    return Infinity;
  }
  const _n = Number(_p.stock);
  return isNaN(_n) ? Infinity : Math.max(0, _n);
}
function getCartQtyForProduct(_pid, _exceptKey) {
  return cart.filter(_c => _c.id === _pid && _c.key !== _exceptKey).reduce((_a, _c) => _a + _c.qty, 0);
}
function addToCart(_0x401ae8, _0x2c9095, _0x54705d, _0x8f2c11) {
  const _0x17a3fe = PRODUCTS.find(_0x17ad9f => _0x17ad9f.id === _0x401ae8);
  if (!_0x17a3fe) {
    return;
  }
  if (isOutOfStock(_0x17a3fe)) {
    showSiteToast("দুঃখিত, এই প্রোডাক্টটি স্টকে নেই।");
    return;
  }
  const _0x9fc1a2 = _0x8f2c11 || getFirstImage(_0x17a3fe);
  const _0x32d692 = _0x401ae8 + "|" + (_0x2c9095 || "") + "|" + _0x9fc1a2;
  const _0x1cc00d = cart.find(_0x2c469b => _0x2c469b.key === _0x32d692);
  const _stockLimit = getStockLimit(_0x17a3fe);
  if (getCartQtyForProduct(_0x401ae8) + _0x54705d > _stockLimit) {
    showSiteToast("দুঃখিত, এই প্রোডাক্টের স্টকে মাত্র " + _stockLimit + "টি আছে।");
    return;
  }
  if (_0x1cc00d) {
    _0x1cc00d.qty += _0x54705d;
  } else {
    cart.push({
      key: _0x32d692,
      id: _0x401ae8,
      size: _0x2c9095,
      qty: _0x54705d,
      name: _0x17a3fe.name,
      price: _0x17a3fe.price,
      image: _0x9fc1a2
    });
  }
  saveCart();
  renderCart();
}
function updateQty(_0x1b58dd, _0x20eba4) {
  const _0x4a9d68 = cart.find(_0x5b41c2 => _0x5b41c2.key === _0x1b58dd);
  if (!_0x4a9d68) {
    return;
  }
  if (_0x20eba4 > 0) {
    const _pr = PRODUCTS.find(_p => _p.id === _0x4a9d68.id);
    const _lim = getStockLimit(_pr);
    if (getCartQtyForProduct(_0x4a9d68.id) + _0x20eba4 > _lim) {
      showSiteToast("দুঃখিত, এই প্রোডাক্টের স্টকে মাত্র " + _lim + "টি আছে।");
      return;
    }
  }
  _0x4a9d68.qty += _0x20eba4;
  if (_0x4a9d68.qty <= 0) {
    cart = cart.filter(_0x2c8bd3 => _0x2c8bd3.key !== _0x1b58dd);
  }
  saveCart();
  renderCart();
}
function removeItem(_0x115dcd) {
  cart = cart.filter(_0x36c012 => _0x36c012.key !== _0x115dcd);
  saveCart();
  renderCart();
}
function bumpBadge(_0x48b88b, _0xac5fa8) {
  if (!_0x48b88b) {
    return;
  }
  const _0x186b97 = _0x48b88b.textContent !== String(_0xac5fa8);
  _0x48b88b.textContent = _0xac5fa8;
  if (_0x186b97) {
    _0x48b88b.classList.remove("badge-bump");
    _0x48b88b.offsetWidth;
    _0x48b88b.classList.add("badge-bump");
  }
}
function renderCartCount() {
  const _0x3caf75 = cart.reduce((_0x5597ad, _0x38a45c) => _0x5597ad + _0x38a45c.qty, 0);
  bumpBadge(cartCountEl, _0x3caf75);
  const _0x489447 = document.getElementById("bnCartCount");
  if (_0x489447) {
    bumpBadge(_0x489447, _0x3caf75);
    _0x489447.classList.toggle("hidden", _0x3caf75 === 0);
  }
}
function cartItemCouponHtml(_0x376166) {
  const _0x475919 = getProductCoupon(_0x376166.id);
  if (!_0x475919) {
    return "";
  }
  const _0x234255 = _0x475919.type === "free_delivery" ? "🚚 ফ্রি ডেলিভারি" : _0x475919.type === "fixed" ? formatTaka(_0x475919.value) + " ছাড়" : _0x475919.value + "% ছাড়";
  const _0x1a7a65 = appliedCoupons.some(_0x12e3fc => _0x12e3fc.code === _0x475919.code);
  if (_0x1a7a65) {
    return "\n      <div class=\"cart-item-coupon applied\">\n        <span>🏷️ " + (_0x475919.label || "বিশেষ অফার") + " — " + _0x234255 + "</span>\n        <button type=\"button\" class=\"cart-item-coupon-remove\" data-code=\"" + _0x475919.code + "\" title=\"কুপন সরিয়ে ফেলুন\">×</button>\n      </div>";
  }
  return "<button type=\"button\" class=\"cart-item-coupon-apply\" data-code=\"" + _0x475919.code + "\">🏷️ " + (_0x475919.label || "বিশেষ অফার") + " — " + _0x234255 + " প্রয়োগ করুন</button>";
}
async function applyCartItemCoupon(_0x363b92) {
  const _0x183572 = await validateCoupon(_0x363b92, cart);
  if (_0x183572.ok) {
    const _0x1e284e = _0x183572.coupon;
    appliedCoupons = appliedCoupons.filter(_0x1437af => _0x1437af.productId ? _0x1437af.productId !== _0x1e284e.productId : !!_0x1e284e.productId);
    appliedCoupons.push(_0x1e284e);
    showSiteToast("\"" + (_0x1e284e.label || "অফার") + "\" প্রয়োগ হয়ে গেছে 🎉");
  } else {
    showSiteToast(_0x183572.reason || "কুপনটি এখন প্রয়োগ করা যাচ্ছে না।");
  }
  renderCart();
}
function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<div class=\"empty-cart\">আপনার কার্ট খালি<br>প্রোডাক্ট যোগ করুন</div>";
  } else {
    cartItemsEl.innerHTML = cart.map(_0x2631a7 => "\n      <div class=\"cart-item\">\n        <img src=\"" + (_0x2631a7.image || PLACEHOLDER_IMG) + "\" alt=\"" + _0x2631a7.name + "\" " + imgFallbackAttr() + ">\n        <div class=\"cart-item-info\">\n          <h4>" + _0x2631a7.name + "</h4>\n          <div class=\"cart-item-meta\">" + (_0x2631a7.size ? "ভ্যারিয়েন্ট: " + _0x2631a7.size + " • " : "") + formatTaka(_0x2631a7.price) + "</div>\n          <div class=\"qty-row\">\n            <button class=\"qty-btn\" data-key=\"" + _0x2631a7.key + "\" data-d=\"-1\">−</button>\n            <span>" + _0x2631a7.qty + "</span>\n            <button class=\"qty-btn\" data-key=\"" + _0x2631a7.key + "\" data-d=\"1\">+</button>\n            <button class=\"remove-btn\" data-key=\"" + _0x2631a7.key + "\">সরান</button>\n          </div>\n          " + cartItemCouponHtml(_0x2631a7) + "\n        </div>\n      </div>\n    ").join("");
    cartItemsEl.querySelectorAll(".qty-btn").forEach(_0x22b1c7 => {
      _0x22b1c7.addEventListener("click", () => updateQty(_0x22b1c7.dataset.key, parseInt(_0x22b1c7.dataset.d)));
    });
    cartItemsEl.querySelectorAll(".remove-btn").forEach(_0xb1a282 => {
      _0xb1a282.addEventListener("click", () => removeItem(_0xb1a282.dataset.key));
    });
    cartItemsEl.querySelectorAll(".cart-item-coupon-apply").forEach(_0x46dc57 => {
      _0x46dc57.addEventListener("click", () => applyCartItemCoupon(_0x46dc57.dataset.code));
    });
    cartItemsEl.querySelectorAll(".cart-item-coupon-remove").forEach(_0x3da62c => {
      _0x3da62c.addEventListener("click", () => {
        appliedCoupons = appliedCoupons.filter(_0x553ab1 => _0x553ab1.code !== _0x3da62c.dataset.code);
        renderCart();
      });
    });
  }
  const _0x5c8177 = cart.reduce((_0x1fcdfd, _0x2c5fcd) => _0x1fcdfd + _0x2c5fcd.price * _0x2c5fcd.qty, 0);
  cartSubtotalEl.textContent = formatTaka(_0x5c8177);
  popNumberChange(cartSubtotalEl);
  renderCartCount();
  renderCouponDiscount(_0x5c8177);
}
function getSingleCouponDiscount(_0x5345a9, _0x1b6b5b) {
  if (_0x5345a9.type === "free_delivery") {
    return 0;
  }
  const _0x57bd9d = _0x5345a9.productId ? getProductLineSubtotal(cart, _0x5345a9.productId) : _0x1b6b5b;
  if (_0x5345a9.type === "fixed") {
    return Math.min(Number(_0x5345a9.value) || 0, _0x57bd9d);
  } else {
    return Math.round(_0x57bd9d * (Number(_0x5345a9.value) || 0) / 100);
  }
}
function getCouponDiscount(_0x5c8532) {
  if (!appliedCoupons.length) {
    return 0;
  }
  const _0xtotalDisc = appliedCoupons.reduce((_0x5d01e9, _0x2c7274) => _0x5d01e9 + getSingleCouponDiscount(_0x2c7274, _0x5c8532), 0);
  return Math.max(0, Math.min(_0xtotalDisc, _0x5c8532));
}
function hasFreeDeliveryProductInCart() {
  return cart.some(_ci => {
    const _pr = (typeof PRODUCTS !== "undefined" ? PRODUCTS : []).find(_p => _p.id === _ci.id);
    return !!(_pr && _pr.freeDelivery);
  });
}
function hasActiveFreeDelivery() {
  if (cart.length > 0 && hasFreeDeliveryProductInCart()) {
    return true;
  }
  return appliedCoupons.some(_0x2eb66 => _0x2eb66.type === "free_delivery" && (!_0x2eb66.productId || getProductLineSubtotal(cart, _0x2eb66.productId) > 0));
}
function getDeliveryCharge() {
  if (cart.length === 0) {
    return 0;
  }
  if (hasActiveFreeDelivery()) {
    return 0;
  } else {
    return DELIVERY_CHARGE;
  }
}
function renderCouponDiscount(_0x2b29f1) {
  const _0x4f1c37 = document.getElementById("cartDiscountRow");
  const _0x983e16 = document.getElementById("cartDiscountAmount");
  const _0x25eaa9 = document.getElementById("cartGrandTotal");
  const _0x269a84 = document.getElementById("cartDeliveryRow");
  const _0x4ac4a2 = document.getElementById("cartDeliveryAmount");
  const _0x28ff2f = getCouponDiscount(_0x2b29f1);
  const _0x3448a7 = getDeliveryCharge();
  const _0x178970 = cart.length > 0 && hasActiveFreeDelivery();
  if (_0x4f1c37 && _0x983e16) {
    if (_0x28ff2f > 0) {
      _0x4f1c37.classList.remove("hidden");
      _0x983e16.textContent = "- " + formatTaka(_0x28ff2f);
    } else {
      _0x4f1c37.classList.add("hidden");
    }
  }
  if (_0x269a84 && _0x4ac4a2) {
    if (_0x178970) {
      _0x269a84.classList.remove("hidden");
      _0x4ac4a2.textContent = "ফ্রি 🎉";
    } else if (_0x3448a7 > 0) {
      _0x269a84.classList.remove("hidden");
      _0x4ac4a2.textContent = formatTaka(_0x3448a7);
    } else {
      _0x269a84.classList.add("hidden");
    }
  }
  if (_0x25eaa9) {
    _0x25eaa9.textContent = formatTaka(_0x2b29f1 - _0x28ff2f + _0x3448a7);
    popNumberChange(_0x25eaa9);
  }
  renderAppliedCouponsList();
}
function renderAppliedCouponsList() {
  const _0x4896cc = document.getElementById("appliedCouponsList");
  if (!_0x4896cc) {
    return;
  }
  const _0x17c287 = appliedCoupons.filter(_0x28d57f => !_0x28d57f.productId);
  _0x4896cc.innerHTML = _0x17c287.map(_0x817945 => "\n    <span class=\"applied-coupon-chip\">\n      🏷️ " + (_0x817945.label || _0x817945.code) + (_0x817945.type === "free_delivery" ? " 🚚" : "") + "\n      <button type=\"button\" data-remove-coupon=\"" + _0x817945.code + "\" title=\"এই কুপনটি সরিয়ে ফেলুন\">×</button>\n    </span>").join("");
  _0x4896cc.querySelectorAll("[data-remove-coupon]").forEach(_0x4f9af2 => {
    _0x4f9af2.addEventListener("click", () => {
      appliedCoupons = appliedCoupons.filter(_0x11b279 => _0x11b279.code !== _0x4f9af2.dataset.removeCoupon);
      renderCart();
    });
  });
}
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponInput = document.getElementById("couponInput");
const couponMsgEl = document.getElementById("couponMsg");
if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", async () => {
    const _0x553fc8 = (couponInput.value || "").trim().toUpperCase();
    couponMsgEl.classList.remove("hidden");
    couponMsgEl.textContent = "যাচাই করা হচ্ছে...";
    couponMsgEl.className = "coupon-msg";
    applyCouponBtn.disabled = true;
    if (!COUPONS.length) {
      await loadCoupons();
    }
    const _0x6f1a02 = COUPONS.find(_0xc0ffee => (_0xc0ffee.code || "").toUpperCase() === _0x553fc8);
    if (_0x6f1a02 && _0x6f1a02.productId && _0x6f1a02.active !== false && !cart.some(_0x2201b9 => _0x2201b9.id === _0x6f1a02.productId)) {
      addToCart(_0x6f1a02.productId, null, 1);
    }
    const _0x25d55f = await validateCoupon(_0x553fc8, cart);
    applyCouponBtn.disabled = false;
    if (_0x25d55f.ok) {
      const _0x44ee46 = _0x25d55f.coupon;
      if (appliedCoupons.some(_0xcb8eea => _0xcb8eea.code === _0x44ee46.code)) {
        couponMsgEl.textContent = "এই কুপনটি ইতিমধ্যেই প্রয়োগ করা আছে।";
        couponMsgEl.className = "coupon-msg error";
        renderCart();
        return;
      }
      appliedCoupons = appliedCoupons.filter(_0x5f12b4 => _0x5f12b4.productId ? _0x5f12b4.productId !== _0x44ee46.productId : !!_0x44ee46.productId);
      appliedCoupons.push(_0x44ee46);
      const _0x5d962f = cart.reduce((_0x42156e, _0x5dd23d) => _0x42156e + _0x5dd23d.price * _0x5dd23d.qty, 0);
      const _0x493bd2 = getCouponDiscount(_0x5d962f);
      const _0x11d8a8 = _0x5d962f - _0x493bd2 + getDeliveryCharge();
      const _0x58ceea = _0x44ee46.productId ? "\"" + (_0x44ee46.productName || "প্রোডাক্টটি") + "\"-তে " : "";
      const _0x8d59c4 = appliedCoupons.length > 1 ? " (মোট " + appliedCoupons.length + "টি কুপন সক্রিয়)" : "";
      if (_0x44ee46.appliedMsg) {
        couponMsgEl.textContent = _0x44ee46.appliedMsg.replace(/\{total\}/g, formatTaka(_0x11d8a8)).replace(/\{discount\}/g, formatTaka(_0x44ee46.type === "free_delivery" ? DELIVERY_CHARGE : _0x493bd2));
      } else if (_0x44ee46.type === "free_delivery") {
        couponMsgEl.textContent = "কুপন প্রয়োগ হয়েছে! " + _0x58ceea + "ডেলিভারি চার্জ সম্পূর্ণ ফ্রি হয়ে গেছে" + _0x8d59c4 + "। ছাড়ের পর সর্বমোট: " + formatTaka(_0x11d8a8);
      } else {
        const _0x32785d = _0x44ee46.type === "fixed" ? formatTaka(_0x44ee46.value) : _0x44ee46.value + "%";
        couponMsgEl.textContent = "কুপন প্রয়োগ হয়েছে! " + _0x58ceea + _0x32785d + " ছাড়" + _0x8d59c4 + " — " + formatTaka(_0x493bd2) + " বাঁচবে। ছাড়ের পর সর্বমোট: " + formatTaka(_0x11d8a8);
      }
      couponMsgEl.className = "coupon-msg ok";
      couponInput.value = "";
    } else {
      couponMsgEl.textContent = _0x25d55f.reason;
      couponMsgEl.className = "coupon-msg error";
    }
    renderCart();
  });
}
// ============================================================
// অটো-লগইন (ব্রাউজার স্টোরেজ ভিত্তিক): একবার অর্ডার করলে কাস্টমারের তথ্য ও অর্ডার আইডি
// এই ডিভাইসের localStorage-এ থেকে যায়। পরে আবার এলে ফর্ম নিজে ভরে যায় এবং প্রোফাইলে
// তার সব অর্ডারের অবস্থা দেখা যায়। পাসওয়ার্ড নেই — তাই শেয়ার করা ডিভাইসে "লগআউট" বাটন আছে।
// ============================================================
function getSavedCustomer() {
  try {
    const _c = JSON.parse(localStorage.getItem("openshop_customer") || "null");
    return _c && _c.phone ? _c : null;
  } catch (_e) {
    return null;
  }
}
function saveCustomer(_c) {
  try {
    localStorage.setItem("openshop_customer", JSON.stringify(_c));
  } catch (_e) {}
}
function getMyOrderIds() {
  try {
    const _l = JSON.parse(localStorage.getItem("openshop_my_orders") || "[]");
    return Array.isArray(_l) ? _l : [];
  } catch (_e) {
    return [];
  }
}
function addMyOrderId(_id) {
  try {
    const _l = getMyOrderIds().filter(_x => _x !== _id);
    _l.unshift(_id);
    localStorage.setItem("openshop_my_orders", JSON.stringify(_l.slice(0, 30)));
  } catch (_e) {}
}
function customerLogout() {
  ["openshop_customer", "openshop_my_orders", "openshop_profile_phone"].forEach(_k => localStorage.removeItem(_k));
  ["leadName", "leadPhone", "leadAddress"].forEach(_id => {
    const _el = document.getElementById(_id);
    if (_el) {
      _el.value = "";
    }
  });
  const _d = document.getElementById("leadDistrict");
  const _u = document.getElementById("leadUpazila");
  if (_d) {
    _d.value = "";
    _d.dispatchEvent(new Event("change"));
  }
  if (_u) {
    _u.value = "";
  }
}
function prefillCheckoutForm() {
  const _c = getSavedCustomer();
  const _phone = _c ? _c.phone : localStorage.getItem("openshop_profile_phone");
  const _setIfEmpty = (_id, _v) => {
    const _el = document.getElementById(_id);
    if (_el && _v && !_el.value) {
      _el.value = _v;
    }
  };
  _setIfEmpty("leadPhone", _phone);
  if (!_c) {
    return;
  }
  _setIfEmpty("leadName", _c.name);
  _setIfEmpty("leadAddress", _c.address);
  const _d = document.getElementById("leadDistrict");
  const _u = document.getElementById("leadUpazila");
  if (_d && _c.district && !_d.value) {
    _d.value = _c.district;
    if (_d.value === _c.district) {
      _d.dispatchEvent(new Event("change"));
      if (_u && _c.upazila) {
        _u.value = _c.upazila;
      }
    }
  }
}
function escHtmlLite(_t) {
  return String(_t == null ? "" : _t).replace(/[&<>"']/g, _ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[_ch]);
}
function _cartDom() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  updateBodyScrollLock();
}
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  updateBodyScrollLock();
  layerOpen("cart", _cartDom);
  clearCheckoutError();
  prefillCheckoutForm();
  captureVisitorLocation();
}
function closeCart() {
  layerClose("cart", _cartDom);
}
cartBtn.addEventListener("click", () => {
  renderCart();
  openCart();
});
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", () => {
  closeCart();
  closeProfile();
  if (typeof closeWishlist === "function") {
    closeWishlist();
  }
});
function generateOrderId() {
  // অর্ডার আইডিই এখন ডকুমেন্টের ID, তাই অনুমান করা যাবে না এমন লম্বা র‍্যান্ডম আইডি (ক্রিপ্টো র‍্যান্ডম)
  const _chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const _arr = new Uint32Array(8);
  (window.crypto || window.msCrypto).getRandomValues(_arr);
  let _id = "";
  for (let _i = 0; _i < _arr.length; _i++) {
    _id += _chars[_arr[_i] % _chars.length];
  }
  return "OS" + _id;
}
async function buildOrderImageFiles(_0x7db5d9) {
  const _0x22e6f8 = [];
  const _0x1a03b6 = new Set();
  for (const _0x59193b of _0x7db5d9) {
    const _0x183733 = _0x59193b.image;
    if (!_0x183733 || _0x1a03b6.has(_0x183733)) {
      continue;
    }
    _0x1a03b6.add(_0x183733);
    try {
      const _0x236a59 = await fetch(_0x183733, {
        mode: "cors"
      });
      if (!_0x236a59.ok) {
        continue;
      }
      const _0xcb7abd = await _0x236a59.blob();
      if (!_0xcb7abd.type.startsWith("image/")) {
        continue;
      }
      const _0x2cbbd5 = (_0xcb7abd.type.split("/")[1] || "jpg").split("+")[0];
      const _0xdfa15c = (_0x59193b.name || "product").replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, "_").slice(0, 30);
      _0x22e6f8.push(new File([_0xcb7abd], _0xdfa15c + "." + _0x2cbbd5, {
        type: _0xcb7abd.type
      }));
    } catch (_0x238e8c) {
      console.warn("এই ছবিটা শেয়ারে যোগ করা যায়নি (CORS/নেটওয়ার্ক সমস্যা):", _0x183733, _0x238e8c.message);
    }
  }
  return _0x22e6f8;
}
const orderConfirmModal = document.getElementById("orderConfirmModal");
const orderIdField = document.getElementById("orderIdField");
const copyOrderIdBtn = document.getElementById("copyOrderIdBtn");
const reopenWaBtn = document.getElementById("reopenWaBtn");
const shareWithImagesBtn = document.getElementById("shareWithImagesBtn");
const orderConfirmClose = document.getElementById("orderConfirmClose");
let lastOrder = null;
function openOrderConfirmModal(_0x57d95e, _0x50eda3, _0x3b03ea, _0x3b74ec) {
  lastOrder = {
    orderId: _0x57d95e,
    waUrl: _0x50eda3,
    msg: _0x3b03ea,
    cartSnapshot: _0x3b74ec
  };
  orderIdField.value = _0x57d95e;
  copyOrderIdBtn.textContent = "কপি করুন";
  shareWithImagesBtn.classList.toggle("hidden", !navigator.share);
  shareWithImagesBtn.textContent = "📸 ছবিসহ শেয়ার করুন (ঐচ্ছিক)";
  shareWithImagesBtn.disabled = false;
  orderConfirmModal.classList.add("open");
  updateBodyScrollLock();
  layerOpen("orderConfirm", _orderConfirmDom);
}
function _orderConfirmDom() {
  orderConfirmModal.classList.remove("open");
  updateBodyScrollLock();
}
function closeOrderConfirmModal() {
  layerClose("orderConfirm", _orderConfirmDom);
}
orderConfirmClose.addEventListener("click", closeOrderConfirmModal);
orderConfirmModal.addEventListener("click", _0x4d162e => {
  if (_0x4d162e.target === orderConfirmModal) {
    closeOrderConfirmModal();
  }
});
copyOrderIdBtn.addEventListener("click", async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(orderIdField.value);
    } else {
      orderIdField.removeAttribute("readonly");
      orderIdField.select();
      document.execCommand("copy");
      orderIdField.setAttribute("readonly", "true");
    }
    copyOrderIdBtn.textContent = "কপি হয়েছে ✅";
    setTimeout(() => {
      copyOrderIdBtn.textContent = "কপি করুন";
    }, 1800);
  } catch (_0x6fc62a) {
    orderIdField.removeAttribute("readonly");
    orderIdField.select();
    alert("অটো-কপি কাজ করেনি, উপরে নম্বরটা সিলেক্ট করে ম্যানুয়ালি কপি করুন।");
  }
});
reopenWaBtn.addEventListener("click", () => {
  if (lastOrder) {
    window.open(lastOrder.waUrl, "_blank");
  }
});
shareWithImagesBtn.addEventListener("click", async () => {
  if (!lastOrder || !navigator.share) {
    return;
  }
  shareWithImagesBtn.disabled = true;
  shareWithImagesBtn.textContent = "ছবি প্রস্তুত হচ্ছে...";
  try {
    const _0x206c72 = await buildOrderImageFiles(lastOrder.cartSnapshot);
    const _0x53148c = {
      title: "Openshop অর্ডার #" + lastOrder.orderId,
      text: lastOrder.msg
    };
    if (_0x206c72.length && (!navigator.canShare || navigator.canShare({
      files: _0x206c72
    }))) {
      _0x53148c.files = _0x206c72;
    }
    await navigator.share(_0x53148c);
  } catch (_0x4de1a8) {
    if (_0x4de1a8.name !== "AbortError") {
      alert("এই ব্রাউজারে ছবিসহ শেয়ার করা গেল না। WhatsApp চ্যাটে অর্ডারের মেসেজটা তো চলে গেছে, চাইলে ছবি ম্যানুয়ালি অ্যাটাচ করে পাঠাতে পারেন।");
    }
  }
  shareWithImagesBtn.disabled = false;
  shareWithImagesBtn.textContent = "📸 ছবিসহ শেয়ার করুন (ঐচ্ছিক)";
});
const leadDistrictEl = document.getElementById("leadDistrict");
const leadUpazilaEl = document.getElementById("leadUpazila");
if (leadDistrictEl && typeof BD_LOCATIONS !== "undefined") {
  Object.keys(BD_LOCATIONS).sort((_0x2569f1, _0x3265dd) => _0x2569f1.localeCompare(_0x3265dd, "bn")).forEach(_0x1454e0 => {
    const _0x3e866f = document.createElement("option");
    _0x3e866f.value = _0x1454e0;
    _0x3e866f.textContent = _0x1454e0;
    leadDistrictEl.appendChild(_0x3e866f);
  });
  leadDistrictEl.addEventListener("change", () => {
    const _0x350fd3 = leadDistrictEl.value;
    leadUpazilaEl.innerHTML = "<option value=\"\">নির্বাচন করুন</option>";
    if (_0x350fd3 && BD_LOCATIONS[_0x350fd3]) {
      leadUpazilaEl.disabled = false;
      BD_LOCATIONS[_0x350fd3].forEach(_0x50843a => {
        const _0x32dd0d = document.createElement("option");
        _0x32dd0d.value = _0x50843a;
        _0x32dd0d.textContent = _0x50843a;
        leadUpazilaEl.appendChild(_0x32dd0d);
      });
    } else {
      leadUpazilaEl.disabled = true;
    }
    leadDistrictEl.classList.remove("invalid");
  });
  leadUpazilaEl.addEventListener("change", () => leadUpazilaEl.classList.remove("invalid"));
}
const toastHost = document.getElementById("toastHost");
function showSiteToast(_0x1986b7, _0x84f857) {
  if (!toastHost) {
    return;
  }
  const _0x2122b9 = document.createElement("div");
  _0x2122b9.className = "site-toast";
  _0x2122b9.innerHTML = "<span class=\"toast-icon\">" + (_0x84f857 || "✅") + "</span><span>" + _0x1986b7 + "</span>";
  toastHost.appendChild(_0x2122b9);
  setTimeout(() => _0x2122b9.remove(), 4200);
}
const checkoutErrorEl = document.getElementById("checkoutError");
function showCheckoutError(_0x3d8557, _0x2a67cf) {
  checkoutErrorEl.textContent = _0x3d8557;
  checkoutErrorEl.classList.remove("hidden");
  document.querySelectorAll(".lead-input.invalid").forEach(_0x220cea => _0x220cea.classList.remove("invalid"));
  const _0x31c5db = _0x2a67cf ? document.getElementById(_0x2a67cf) : null;
  if (_0x31c5db) {
    _0x31c5db.classList.add("invalid");
    _0x31c5db.focus();
    _0x31c5db.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
function clearCheckoutError() {
  checkoutErrorEl.classList.add("hidden");
  checkoutErrorEl.textContent = "";
  document.querySelectorAll(".lead-input.invalid").forEach(_0x2a3d91 => _0x2a3d91.classList.remove("invalid"));
}
["leadName", "leadPhone", "leadAddress", "leadDistrict", "leadUpazila"].forEach(_0x189e09 => {
  const _0x2a09db = document.getElementById(_0x189e09);
  if (_0x2a09db) {
    _0x2a09db.addEventListener("input", () => _0x2a09db.classList.remove("invalid"));
  }
});
function handleLocationRequiredForCheckout() {
  // এই ফাংশন সরাসরি "অর্ডার করুন" ট্যাপের ভেতর থেকে ডাকা হয়, তাই ব্রাউজার পপআপ দেখাবে। Allow করলে অর্ডার নিজে থেকেই এগিয়ে যায়।
  const _card = document.querySelector("#cartDrawer [data-loc-card]");
  if (_card) {
    _card.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
  captureVisitorLocation(() => {
    clearCheckoutError();
    checkoutBtn.click();
  }, _reason => {
    if (_reason === "no-geolocation") {
      showCheckoutError("এই ব্রাউজারে লোকেশন সাপোর্ট নেই — লিংকটা Chrome/Safari-তে খুলে অর্ডার করুন।");
    } else if (_reason === "denied") {
      showCheckoutError("লোকেশন Allow না করলে অর্ডার করা যাবে না। ঠিকানা বারের 🔒 আইকনে ট্যাপ করে লোকেশন Allow করুন, তারপর আবার চেষ্টা করুন।");
    } else {
      showCheckoutError("লোকেশন পাওয়া যায়নি — GPS ও ইন্টারনেট চালু আছে কিনা দেখে আবার চেপে দেখুন।");
    }
  });
}
checkoutBtn.addEventListener("click", () => {
  clearCheckoutError();
  if (cart.length === 0) {
    showCheckoutError("আপনার কার্ট খালি — অর্ডার করার আগে প্রোডাক্ট যোগ করুন।");
    return;
  }
  // স্টক রি-চেক: কার্ট লোকালস্টোরেজে থাকে, এর মধ্যে স্টক কমে গিয়ে থাকতে পারে
  const _stockSeen = {};
  for (const _ci of cart) {
    const _pr = PRODUCTS.find(_p => _p.id === _ci.id);
    if (!_pr) {
      continue;
    }
    const _lim = getStockLimit(_pr);
    _stockSeen[_ci.id] = (_stockSeen[_ci.id] || 0) + _ci.qty;
    if (_stockSeen[_ci.id] > _lim) {
      showCheckoutError("দুঃখিত, \"" + _ci.name + "\" এর স্টকে এখন মাত্র " + _lim + "টি আছে — কার্টের পরিমাণ কমিয়ে আবার চেষ্টা করুন।");
      return;
    }
  }
  if (!visitorLocation) {
    // ভুয়া অর্ডার ঠেকাতে লোকেশন বাধ্যতামূলক
    handleLocationRequiredForCheckout();
    return;
  }
  const _0x38a4cd = document.getElementById("leadName").value.trim();
  const _0x476211 = document.getElementById("leadPhone").value.trim();
  const _0x4697c5 = document.getElementById("leadDistrict").value.trim();
  const _0x17fda1 = document.getElementById("leadUpazila").value.trim();
  const _0x165191 = document.getElementById("leadAddress").value.trim();
  const _0x363c46 = cart.reduce((_0x421b41, _0x11a966) => _0x421b41 + _0x11a966.price * _0x11a966.qty, 0);
  if (appliedCoupons.length) {
    const _0x40e9a3 = new Date().toISOString().slice(0, 10);
    const _0x2a5f6d = appliedCoupons.length;
    appliedCoupons = appliedCoupons.filter(_0x1e373c => {
      const _0x345f0e = COUPONS.some(_0x474b5f => (_0x474b5f.code || "").toUpperCase() === _0x1e373c.code && _0x474b5f.active !== false);
      const _0x2aa79c = !_0x1e373c.expiry || _0x1e373c.expiry >= _0x40e9a3;
      const _0x3ba75a = _0x1e373c.productId ? getProductLineSubtotal(cart, _0x1e373c.productId) : _0x363c46;
      const _0x8b3d3a = !_0x1e373c.productId || _0x3ba75a > 0;
      const _0x204b22 = _0x3ba75a >= Number(_0x1e373c.minOrder || 0);
      return _0x345f0e && _0x2aa79c && _0x8b3d3a && _0x204b22;
    });
    if (appliedCoupons.length < _0x2a5f6d) {
      if (couponMsgEl) {
        couponMsgEl.textContent = "একটি বা একাধিক কুপন আর প্রযোজ্য নয়, তাই বাদ দেওয়া হয়েছে — চাইলে আবার চেক করে প্রয়োগ করুন।";
        couponMsgEl.className = "coupon-msg error";
      }
      renderCart();
    }
  }
  const _0x22df64 = getCouponDiscount(_0x363c46);
  const _0x36c7e2 = getDeliveryCharge();
  const _0x47c533 = _0x363c46 - _0x22df64 + _0x36c7e2;
  if (!isValidLeadName(_0x38a4cd)) {
    showCheckoutError("অনুগ্রহ করে আপনার সঠিক নাম দিন (শুধু অক্ষর, অন্তত ২ অক্ষর — সংখ্যা বা ভুয়া লেখা চলবে না)।", "leadName");
    return;
  }
  if (!isValidBDPhone(_0x476211)) {
    showCheckoutError("অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)। ভুল/ভুয়া নম্বর দিয়ে অর্ডার করা যাবে না।", "leadPhone");
    return;
  }
  if (!_0x4697c5) {
    showCheckoutError("অনুগ্রহ করে আপনার জেলা নির্বাচন করুন — এই জায়গাটি খালি।", "leadDistrict");
    return;
  }
  if (!_0x17fda1) {
    showCheckoutError("অনুগ্রহ করে আপনার উপজেলা নির্বাচন করুন — এই জায়গাটি খালি।", "leadUpazila");
    return;
  }
  if (!isValidLeadAddress(_0x165191)) {
    showCheckoutError("অনুগ্রহ করে বাসা/রোড/গ্রামের নাম দিন — অন্তত ৬ অক্ষর, শুধু সংখ্যা/সিম্বল দিয়ে হবে না।", "leadAddress");
    return;
  }
  const _0x9f27a2 = _0x165191 + ", " + _0x17fda1 + ", " + _0x4697c5;
  localStorage.setItem("openshop_profile_phone", normalizePhone(_0x476211));
  saveCustomer({
    name: _0x38a4cd,
    phone: normalizePhone(_0x476211),
    district: _0x4697c5,
    upazila: _0x17fda1,
    address: _0x165191
  });
  const _0x3c7502 = generateOrderId();
  addMyOrderId(_0x3c7502);
  const _0x5279df = cart.map(_0x289cc => ({
    ..._0x289cc
  }));
  let _0xe9505f = "আসসালামু আলাইকুম, আমি Openshop থেকে অর্ডার করতে চাই:\n";
  _0xe9505f += "অর্ডার আইডি: " + _0x3c7502 + "\n\n";
  if (_0x38a4cd) {
    _0xe9505f += "নাম: " + _0x38a4cd + "\n";
  }
  _0xe9505f += "ফোন: " + _0x476211 + "\n";
  if (_0x9f27a2) {
    _0xe9505f += "ঠিকানা: " + _0x9f27a2 + "\n";
  }
  if (visitorLocation && visitorLocation.mapsUrl) {
    _0xe9505f += "📍 লোকেশন পিন: " + visitorLocation.mapsUrl + "\n";
  }
  _0xe9505f += "\n";
  cart.forEach((_0x4dd0ab, _0x1bdfdd) => {
    _0xe9505f += _0x1bdfdd + 1 + ". " + _0x4dd0ab.name + (_0x4dd0ab.size ? " (ভ্যারিয়েন্ট: " + _0x4dd0ab.size + ")" : "") + " — " + _0x4dd0ab.qty + " পিস — " + formatTaka(_0x4dd0ab.price * _0x4dd0ab.qty) + "\n";
  });
  _0xe9505f += "\nসাবটোটাল: " + formatTaka(_0x363c46);
  if (_0x22df64 > 0) {
    appliedCoupons.filter(_0x3127fe => _0x3127fe.type !== "free_delivery").forEach(_0x4710ea => {
      const _0x400185 = _0x4710ea.type === "fixed" ? "-" + formatTaka(_0x4710ea.value) : "-" + _0x4710ea.value + "%";
      const _0xe14e03 = getSingleCouponDiscount(_0x4710ea, _0x363c46);
      _0xe9505f += "\nকুপন (" + _0x4710ea.code + (_0x4710ea.productId ? ", " + (_0x4710ea.productName || "নির্দিষ্ট প্রোডাক্ট") : "") + ", " + _0x400185 + "): -" + formatTaka(_0xe14e03);
    });
  }
  const _0x396ef0 = appliedCoupons.find(_0x1a4399 => _0x1a4399.type === "free_delivery");
  if (_0x396ef0) {
    _0xe9505f += "\nকুপন (" + _0x396ef0.code + (_0x396ef0.productId ? ", " + (_0x396ef0.productName || "নির্দিষ্ট প্রোডাক্ট") : "") + "): ফ্রি ডেলিভারি প্রযোজ্য";
  }
  _0xe9505f += "\nডেলিভারি চার্জ: " + (_0x36c7e2 > 0 ? formatTaka(_0x36c7e2) : "ফ্রি");
  _0xe9505f += "\nসর্বমোট: " + formatTaka(_0x47c533);
  const _0x4bc3fe = [...new Set(cart.map(_0x1d93c9 => _0x1d93c9.image).filter(Boolean))];
  if (_0x4bc3fe.length) {
    _0xe9505f += "\n\nপ্রোডাক্টের ছবি:\n" + _0x4bc3fe.map((_0x5eb396, _0x44df46) => _0x44df46 + 1 + ". " + _0x5eb396).join("\n");
  }
  const _0x1d0f65 = window.WHATSAPP_NUMBER_OVERRIDE || WHATSAPP_NUMBER;
  const _0x46be13 = "https://wa.me/" + _0x1d0f65 + "?text=" + encodeURIComponent(_0xe9505f);
  window.open(_0x46be13, "_blank");
  const _0x1ddfe2 = getDb();
  if (_0x1ddfe2) {
    const _orderBatch = _0x1ddfe2.batch();
    _orderBatch.set(_0x1ddfe2.collection("orders").doc(_0x3c7502), {
      orderId: _0x3c7502,
      name: _0x38a4cd || null,
      phone: normalizePhone(_0x476211),
      address: _0x9f27a2 || null,
      location: visitorLocation ? {
        lat: visitorLocation.lat,
        lng: visitorLocation.lng,
        mapsUrl: visitorLocation.mapsUrl
      } : null,
      items: _0x5279df.map(_0x574e85 => ({
        name: _0x574e85.name,
        size: _0x574e85.size,
        qty: _0x574e85.qty,
        price: _0x574e85.price,
        image: _0x574e85.image
      })),
      subtotal: _0x363c46,
      discount: _0x22df64,
      couponCode: appliedCoupons.length ? appliedCoupons.map(_0x187688 => _0x187688.code).join(", ") : null,
      couponCodes: appliedCoupons.length ? appliedCoupons.map(_0x187688 => (_0x187688.code || "").toUpperCase()) : [],
      deliveryCharge: _0x36c7e2,
      total: _0x47c533,
      status: "pending",
      ts: Date.now(),
      day: new Date().toISOString().slice(0, 10)
    });
    // কুপন কাউন্টার অর্ডারের সাথে একই batch-এ লেখা হয় (রুলস অর্ডারটা যাচাই করে)
    appliedCoupons.forEach(_cp => {
      const _code = (_cp.code || "").toUpperCase();
      if (!_code) {
        return;
      }
      _orderBatch.set(_0x1ddfe2.collection("couponUsage").doc(_code), {
        count: firebase.firestore.FieldValue.increment(1),
        orderId: _0x3c7502
      }, {
        merge: true
      });
    });
    _orderBatch.commit().catch(_0x2d566f => console.warn("অর্ডার সেভ করা যায়নি:", _0x2d566f.message));
  }
  openOrderConfirmModal(_0x3c7502, _0x46be13, _0xe9505f, _0x5279df);
  showSiteToast("অর্ডার সম্পন্ন হয়েছে! অর্ডার আইডি: " + _0x3c7502);
  fireConfetti();
  cart = [];
  appliedCoupons = [];
  if (couponInput) {
    couponInput.value = "";
  }
  if (couponMsgEl) {
    couponMsgEl.classList.add("hidden");
  }
  saveCart();
  renderCart();
  closeCart();
  clearCheckoutError();
});
const profileDrawer = document.getElementById("profileDrawer");
const profileBody = document.getElementById("profileBody");
const profileClose = document.getElementById("profileClose");
const STATUS_LABELS = {
  pending: "অপেক্ষমাণ",
  confirmed: "নিশ্চিত হয়েছে",
  processing: "প্রস্তুত হচ্ছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভারি সম্পন্ন",
  cancelled: "বাতিল হয়েছে"
};
function _profileDom() {
  stopOrderLive();
  profileDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  updateBodyScrollLock();
}
function openProfile() {
  profileDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  updateBodyScrollLock();
  renderProfile();
  layerOpen("profile", _profileDom);
}
function closeProfile() {
  layerClose("profile", _profileDom);
}
profileClose.addEventListener("click", closeProfile);
const ORDER_STEPS = [
  { key: "pending", label: "অর্ডার করা হয়েছে", icon: "📝" },
  { key: "confirmed", label: "নিশ্চিত হয়েছে", icon: "✅" },
  { key: "processing", label: "প্রস্তুত হচ্ছে", icon: "📦" },
  { key: "shipped", label: "পাঠানো হয়েছে", icon: "🚚" },
  { key: "delivered", label: "ডেলিভারি সম্পন্ন", icon: "🏠" }
];
const ORDER_STEP_MSG = {
  pending: "আপনার অর্ডার আমরা পেয়েছি, শীঘ্রই কনফার্ম করা হবে।",
  confirmed: "আপনার অর্ডার কনফার্ম হয়েছে।",
  processing: "আপনার প্রোডাক্ট প্যাকেজিং ও পাঠানোর জন্য প্রস্তুত হচ্ছে।",
  shipped: "আপনার প্যাকেজ কুরিয়ারে পাঠানো হয়েছে — শীঘ্রই পৌঁছে যাবে।",
  delivered: "আপনার অর্ডার ডেলিভারি সম্পন্ন হয়েছে। ধন্যবাদ! 🎉"
};
function orderCardHtml(_o) {
  const _st = _o.status || "pending";
  const _dt = new Date(_o.ts);
  const _date = _dt.toLocaleDateString("bn-BD") + " " + _dt.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const _fmt = _n => formatTaka(_n || 0);
  const _items = (_o.items || []).map(_it => "<div class=\"ot-item\">" + (_it.image ? "<img src=\"" + escHtmlLite(_it.image) + "\" alt=\"\" loading=\"lazy\">" : "") + "<div><b>" + escHtmlLite(_it.name) + "</b><small>" + (_it.size ? "সাইজ: " + escHtmlLite(_it.size) + " • " : "") + "পরিমাণ: " + escHtmlLite(_it.qty) + " • " + _fmt(_it.price) + "</small></div></div>").join("");
  let _tracker;
  if (_st === "cancelled") {
    _tracker = "<div class=\"ot-cancelled\"><span class=\"ot-cancel-icon\">✕</span><div><b>অর্ডার বাতিল হয়েছে</b><small>বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন</small></div></div>";
  } else {
    const _idx = Math.max(0, ORDER_STEPS.findIndex(_x => _x.key === _st));
    _tracker = "<div class=\"ot-steps\">" + ORDER_STEPS.map((_x, _n) => {
      const _cls = _n < _idx ? "done" : _n === _idx ? (_st === "delivered" ? "done current" : "current") : "todo";
      return "<div class=\"ot-step " + _cls + "\"><span class=\"ot-dot\">" + (_n <= _idx ? "✓" : _n + 1) + "</span><span class=\"ot-label\">" + _x.label + "</span></div>";
    }).join("") + "</div>" + "<div class=\"ot-msg\">" + (ORDER_STEP_MSG[_st] || "") + "</div>";
  }
  const _headLabel = _st === "cancelled" ? "বাতিল" : (STATUS_LABELS[_st] || _st);
  const _oid = escHtmlLite(_o.orderId || "");
  const _upd = _o.updatedAt ? "<div class=\"ot-meta\">সর্বশেষ আপডেট: " + new Date(_o.updatedAt).toLocaleString("bn-BD") + "</div>" : "";
  const _courier = _o.trackingNo || _o.consignmentId ? "<div class=\"ot-meta\">🚚 " + (_o.courier ? escHtmlLite(_o.courier) + " • " : "") + "ট্র্যাকিং নং: <b>" + escHtmlLite(_o.trackingNo || _o.consignmentId) + "</b></div>" : "";
  const _disc = _o.discount ? "<div class=\"ot-row\"><span>ডিসকাউন্ট</span><span>-" + _fmt(_o.discount) + "</span></div>" : "";
  const _wa = document.getElementById("waFloat");
  const _waHref = _wa && _wa.href && _wa.href !== "#" && !_wa.href.endsWith("#") ? _wa.href.split("?")[0] + "?text=" + encodeURIComponent("আসসালামু আলাইকুম, আমার অর্ডার আইডি #" + (_o.orderId || "") + " — এর বর্তমান অবস্থা জানতে চাই।") : "";
  return "<div class=\"order-card ot-card " + (_st === "cancelled" ? "is-cancelled" : _st === "delivered" ? "is-delivered" : "") + "\" data-oid=\"" + _oid + "\">" +
    "<div class=\"ot-head\"><div class=\"oid\">অর্ডার #" + _oid + "</div><span class=\"order-status-badge status-" + _st + "\">" + _headLabel + "</span></div>" +
    _tracker + _courier + _upd +
    "<div class=\"ot-items\">" + _items + "</div>" +
    "<div class=\"ot-sum\"><div class=\"ot-row\"><span>সাবটোটাল</span><span>" + _fmt(_o.subtotal) + "</span></div>" + _disc +
    "<div class=\"ot-row\"><span>ডেলিভারি চার্জ</span><span>" + _fmt(_o.deliveryCharge) + "</span></div>" +
    "<div class=\"ot-row ot-total\"><span>সর্বমোট</span><span>" + _fmt(_o.total ?? _o.subtotal) + "</span></div></div>" +
    (_o.address ? "<div class=\"ot-meta\">📍 " + escHtmlLite(_o.address) + "</div>" : "") +
    "<div class=\"ot-meta\">🗓️ অর্ডারের সময়: " + _date + "</div>" +
    "<div class=\"ot-actions\"><button type=\"button\" class=\"ot-btn ot-copy\" data-oid=\"" + _oid + "\">আইডি কপি</button>" +
    (_waHref ? "<a class=\"ot-btn ot-wa\" href=\"" + escHtmlLite(_waHref) + "\" target=\"_blank\" rel=\"noopener\">💬 অর্ডার নিয়ে মেসেজ</a>" : "") + "</div></div>";
}
function cleanTrackId(_t) {
  let _x = String(_t || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (_x && !_x.startsWith("OS")) {
    _x = "OS" + _x;
  }
  return _x;
}
let _orderUnsubs = [];
function stopOrderLive() {
  _orderUnsubs.forEach(_u => {
    try {
      _u();
    } catch (_e) {}
  });
  _orderUnsubs = [];
}
function wireOrderCardActions(_root) {
  _root.querySelectorAll(".ot-copy").forEach(_b => {
    if (_b.dataset.wired) {
      return;
    }
    _b.dataset.wired = "1";
    _b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(_b.dataset.oid);
        _b.textContent = "কপি হয়েছে ✓";
      } catch (_e) {
        _b.textContent = _b.dataset.oid;
      }
    });
  });
}
// রিয়েলটাইম: অ্যাডমিন স্ট্যাটাস বদলালে কার্ড নিজে থেকেই আপডেট হয় (পেজ রিফ্রেশ লাগে না)
function liveOrderCards(_ids, _container) {
  const _db = getDb();
  if (!_db || !_container) {
    return;
  }
  _ids.forEach(_id => {
    try {
      const _un = _db.collection("orders").doc(_id).onSnapshot(_snap => {
        if (!_snap.exists) {
          return;
        }
        const _card = _container.querySelector(".ot-card[data-oid=\"" + _id + "\"]");
        if (!_card) {
          return;
        }
        const _tmp = document.createElement("div");
        _tmp.innerHTML = orderCardHtml(_snap.data());
        _card.replaceWith(_tmp.firstElementChild);
        wireOrderCardActions(_container);
      }, () => {});
      _orderUnsubs.push(_un);
    } catch (_e) {}
  });
}
// ব্যাকগ্রাউন্ডে নজর রাখা: সাইটে থাকা অবস্থায় অর্ডারের স্ট্যাটাস বদলালে টোস্ট দেখায়
function watchMyOrdersForToast() {
  const _db = getDb();
  if (!_db) {
    return;
  }
  let _seen = {};
  try {
    _seen = JSON.parse(localStorage.getItem("openshop_order_seen") || "{}");
  } catch (_e) {}
  getMyOrderIds().slice(0, 5).forEach(_id => {
    if (_seen[_id] === "delivered" || _seen[_id] === "cancelled") {
      return;
    }
    try {
      _db.collection("orders").doc(_id).onSnapshot(_snap => {
        if (!_snap.exists) {
          return;
        }
        const _st = _snap.data().status || "pending";
        if (_seen[_id] && _seen[_id] !== _st) {
          showSiteToast("📦 অর্ডার #" + _id + " — " + (STATUS_LABELS[_st] || _st));
        }
        _seen[_id] = _st;
        try {
          localStorage.setItem("openshop_order_seen", JSON.stringify(_seen));
        } catch (_e) {}
      }, () => {});
    } catch (_e) {}
  });
}
function normalizePhone(_0x4d01f4) {
  return (_0x4d01f4 || "").replace(/\D/g, "");
}
function toWhatsappNumber(_0x4d01f5) {
  const _0xdigits = (_0x4d01f5 || "").replace(/\D/g, "");
  if (_0xdigits.startsWith("880")) {
    return _0xdigits;
  } else if (_0xdigits.startsWith("0")) {
    return "88" + _0xdigits;
  } else {
    return _0xdigits;
  }
}
function isValidBDPhone(_0x4c8088) {
  const _0x46cad7 = normalizePhone(_0x4c8088);
  const _0x4f0808 = _0x46cad7.startsWith("88") ? _0x46cad7.slice(2) : _0x46cad7;
  return /^01[3-9]\d{8}$/.test(_0x4f0808);
}
function isValidLeadName(_0xc64f8b) {
  const _0x523027 = (_0xc64f8b || "").trim();
  if (_0x523027.length < 2 || _0x523027.length > 60) {
    return false;
  }
  return /^[A-Za-z\u0980-\u09FF][A-Za-z\u0980-\u09FF .'-]*$/.test(_0x523027);
}
function isValidLeadAddress(_0x43ed25) {
  const _0x4021ce = (_0x43ed25 || "").trim();
  if (_0x4021ce.length < 6 || _0x4021ce.length > 200) {
    return false;
  }
  return /[A-Za-z\u0980-\u09FF]/.test(_0x4021ce);
}
async function fetchOrderById(_0x1c9c4b) {
  const _0xa3ccb4 = getDb();
  if (!_0xa3ccb4) {
    return [];
  }
  try {
    const _0x6596d2 = await _0xa3ccb4.collection("orders").doc(_0x1c9c4b.trim().toUpperCase()).get();
    return _0x6596d2.exists ? [_0x6596d2.data()] : [];
  } catch (_0x247015) {
    console.warn(_0x247015.message);
    return [];
  }
}
function profileWatchHistoryHtml() {
  let _hList = [];
  try {
    _hList = JSON.parse(localStorage.getItem("openshop_recent") || "[]");
  } catch (_e) {}
  const _hItems = _hList.map(_id => PRODUCTS.find(_p => _p.id === _id)).filter(Boolean).slice(0, 10);
  if (!_hItems.length) {
    return "";
  }
  return "\n    <div class=\"profile-history\">\n      <h4 class=\"profile-history-title\">🕓 আপনার দেখা প্রোডাক্ট</h4>\n      <div class=\"profile-history-scroll\">" + _hItems.map(_p => "\n        <div class=\"related-card profile-history-card\" data-relid=\"" + _p.id + "\">\n          <img src=\"" + getFirstImage(_p) + "\" alt=\"" + _p.name + "\" loading=\"lazy\" " + imgFallbackAttr() + ">\n          <span class=\"r-name\">" + _p.name + "</span>\n          <span class=\"r-price\">" + formatTaka(_p.price) + "</span>\n        </div>\n      ").join("") + "</div>\n    </div>\n  ";
}
function wireProfileWatchHistory() {
  document.querySelectorAll(".profile-history-card").forEach(_card => {
    _card.addEventListener("click", () => {
      closeProfile();
      openModal(_card.dataset.relid);
    });
  });
}
function profileQuickMenuHtml() {
  return "\n    <div class=\"profile-quick-menu\">\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqWishlist\"><span class=\"profile-quick-icon\">❤️</span><span class=\"profile-quick-label\">পছন্দের তালিকা</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqCoupons\"><span class=\"profile-quick-icon\">🏷️</span><span class=\"profile-quick-label\">কুপন</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqDarkMode\"><span class=\"profile-quick-icon\">🌙</span><span class=\"profile-quick-label\">ডার্ক মোড</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqCare\"><span class=\"profile-quick-icon\">🎧</span><span class=\"profile-quick-label\">কাস্টমার কেয়ার</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqShare\"><span class=\"profile-quick-icon\">🔗</span><span class=\"profile-quick-label\">শেয়ার করুন</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqInstall\"><span class=\"profile-quick-icon\">📲</span><span class=\"profile-quick-label\">অ্যাপ ইনস্টল</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqFacebook\"><span class=\"profile-quick-icon\">📘</span><span class=\"profile-quick-label\">ফেসবুক পেজ</span></button>\n      <button type=\"button\" class=\"profile-quick-item\" id=\"pqWhatsapp\"><span class=\"profile-quick-icon\">💬</span><span class=\"profile-quick-label\">হোয়াটসঅ্যাপ</span></button>\n    </div>\n  ";
}
function wireProfileQuickMenu() {
  const _byId = _id => document.getElementById(_id);
  if (_byId("pqWishlist")) _byId("pqWishlist").addEventListener("click", () => {
    closeProfile();
    openWishlist();
  });
  if (_byId("pqCoupons")) _byId("pqCoupons").addEventListener("click", () => openCouponsModal());
  if (_byId("pqDarkMode")) _byId("pqDarkMode").addEventListener("click", () => applyDarkMode(!document.body.classList.contains("dark-mode")));
  if (_byId("pqCare")) _byId("pqCare").addEventListener("click", () => {
    const _careLink = document.getElementById("utilCustomerCare");
    if (_careLink && _careLink.href) window.open(_careLink.href, "_blank");
  });
  if (_byId("pqShare")) _byId("pqShare").addEventListener("click", () => {
    const _shareBtn = document.getElementById("navShareSite");
    if (_shareBtn) _shareBtn.click();
  });
  if (_byId("pqInstall")) _byId("pqInstall").addEventListener("click", () => {
    const _installBtn = document.getElementById("navInstallApp");
    if (_installBtn) _installBtn.click();
  });
  if (_byId("pqFacebook")) _byId("pqFacebook").addEventListener("click", () => {
    const _fbLink = document.getElementById("utilFacebookPage");
    if (_fbLink && _fbLink.href) window.open(_fbLink.href, "_blank");
  });
  if (_byId("pqWhatsapp")) _byId("pqWhatsapp").addEventListener("click", () => {
    const _waLink = document.getElementById("waFloat");
    if (_waLink && _waLink.href) window.open(_waLink.href, "_blank");
  });
}
async function renderCustomerSection() {
  const _c = getSavedCustomer();
  const _guest = profileBody.querySelector(".profile-guest");
  const _ids = getMyOrderIds();
  if (!_guest || !_c && !_ids.length) {
    return;
  }
  if (_c) {
    _guest.innerHTML = "<div class=\"avatar-ph\">👤</div>" +
      "<p><b>" + escHtmlLite(_c.name || "স্বাগতম") + "</b><br><small>" + escHtmlLite(_c.phone) + "</small></p>" +
      "<button type=\"button\" class=\"btn btn-block\" id=\"customerLogoutBtn\" style=\"margin-top:8px;\">লগআউট (এই ডিভাইস থেকে তথ্য মুছুন)</button>";
  }
  const _box = document.createElement("div");
  _box.id = "myOrdersBox";
  _box.innerHTML = "<h4 class=\"profile-history-title\">📦 আমার অর্ডারসমূহ <button type=\"button\" class=\"ot-btn\" id=\"myOrdersRefresh\" style=\"float:right\">🔄 রিফ্রেশ</button></h4><div id=\"myOrdersList\"><p class=\"msg\">লোড হচ্ছে...</p></div>";
  _guest.insertAdjacentElement("afterend", _box);
  const _lo = document.getElementById("customerLogoutBtn");
  if (_lo) {
    _lo.addEventListener("click", () => {
      if (confirm("এই ডিভাইস থেকে আপনার সংরক্ষিত তথ্য ও অর্ডারের তালিকা মুছে ফেলবেন?")) {
        customerLogout();
        renderProfile();
      }
    });
  }
  const _list = document.getElementById("myOrdersList");
  if (!_ids.length) {
    _list.innerHTML = "<p style=\"font-size:13px; color:#8a9791;\">এখনো কোনো অর্ডার নেই।</p>";
    return;
  }
  async function _load() {
    const _results = await Promise.all(_ids.map(_id => fetchOrderById(_id)));
    const _orders = _results.flat().sort((_a, _b) => (_b.ts || 0) - (_a.ts || 0));
    const _el = document.getElementById("myOrdersList");
    if (!_el) {
      return;
    }
    _el.innerHTML = _orders.length ? _orders.map(orderCardHtml).join("") : "<p style=\"font-size:13px; color:#8a9791;\">অর্ডার লোড করা যায়নি।</p>";
    wireOrderCardActions(_el);
    return _orders;
  }
  const _first = await _load();
  if (_first && _first.length) {
    liveOrderCards(_first.map(_o => _o.orderId), document.getElementById("myOrdersList"));
  }
  const _rf = document.getElementById("myOrdersRefresh");
  if (_rf) {
    _rf.addEventListener("click", async () => {
      _rf.textContent = "⏳";
      await _load();
      _rf.textContent = "🔄 রিফ্রেশ";
    });
  }
}
function renderProfile() {
  stopOrderLive();
  profileBody.innerHTML = profileQuickMenuHtml() + profileWatchHistoryHtml() + "\n      <div class=\"profile-guest\">\n        <div class=\"avatar-ph\">👤</div>\n        <p>আপনার অর্ডার আইডি দিয়ে অর্ডারের বর্তমান অবস্থা দেখুন।</p>\n      </div>\n      <div class=\"track-form\">\n        <input type=\"text\" id=\"trackOrderId\" placeholder=\"অর্ডার আইডি (যেমন OS123456)\" class=\"lead-input\">\n        <button class=\"btn btn-primary btn-block\" id=\"trackOrderBtn\">অর্ডার ট্র্যাক করুন</button>\n      </div>\n      <div id=\"trackResult\"></div>\n    ";
  wireProfileQuickMenu();
  wireProfileWatchHistory();
  renderCustomerSection();
  const _trackIn = document.getElementById("trackOrderId");
  async function _doTrack() {
    const _id = cleanTrackId(_trackIn.value);
    const _res = document.getElementById("trackResult");
    if (!_id) {
      _res.innerHTML = "<p style=\"font-size:13px; color:#d93025;\">অর্ডার আইডি লিখুন (যেমন OS8K3M2PQX)।</p>";
      return;
    }
    _trackIn.value = _id;
    _res.innerHTML = "<p class=\"msg\">খোঁজা হচ্ছে...</p>";
    const _found = await fetchOrderById(_id);
    _res.innerHTML = _found.length ? _found.map(orderCardHtml).join("") : "<p style=\"font-size:13px; color:#8a9791;\">এই আইডিতে কোনো অর্ডার পাওয়া যায়নি — আইডিটা আবার মিলিয়ে দেখুন।</p>";
    if (_found.length) {
      wireOrderCardActions(_res);
      liveOrderCards([_id], _res);
    }
  }
  document.getElementById("trackOrderBtn").addEventListener("click", _doTrack);
  _trackIn.addEventListener("keydown", _e => {
    if (_e.key === "Enter") {
      _doTrack();
    }
  });
  const _qTrack = new URLSearchParams(window.location.search).get("track");
  if (_qTrack && !_trackIn.value && !window._trackParamUsed) {
    window._trackParamUsed = true;
    _trackIn.value = _qTrack;
    _doTrack();
  }
}
document.querySelectorAll(".bn-item").forEach(_0x42ad89 => {
  _0x42ad89.addEventListener("click", () => {
    document.querySelectorAll(".bn-item").forEach(_0x3c8198 => _0x3c8198.classList.remove("active"));
    _0x42ad89.classList.add("active");
    const _0x17f58a = _0x42ad89.dataset.bn;
    if (_0x17f58a === "home") {
      if (productModal.classList.contains("open")) {
        closeModal();
      }
      if (cartDrawer.classList.contains("open")) {
        closeCart();
      }
      if (profileDrawer.classList.contains("open")) {
        closeProfile();
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } else if (_0x17f58a === "categories") {
      document.getElementById("categories").scrollIntoView({
        behavior: "smooth"
      });
    } else if (_0x17f58a === "search") {
      document.getElementById("categories").scrollIntoView({
        behavior: "smooth"
      });
      searchInput.focus();
    } else if (_0x17f58a === "cart") {
      renderCart();
      openCart();
    } else if (_0x17f58a === "profile") {
      openProfile();
    }
  });
});
document.addEventListener("keydown", _0x5d4087 => {
  if (_0x5d4087.key !== "Escape") {
    return;
  }
  if (orderConfirmModal.classList.contains("open")) {
    closeOrderConfirmModal();
  } else if (productModal.classList.contains("open")) {
    closeModal();
  } else if (cartDrawer.classList.contains("open")) {
    closeCart();
  } else if (profileDrawer.classList.contains("open")) {
    closeProfile();
  } else {
    const _0x36a720 = document.getElementById("couponsModal");
    if (_0x36a720 && _0x36a720.classList.contains("open")) {
      closeCouponsModal();
    }
  }
});
menuToggle.addEventListener("click", _0x2d65f2 => {
  _0x2d65f2.stopPropagation();
  const _0x5c8118 = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", _0x5c8118 ? "true" : "false");
});
mainNav.querySelectorAll("a").forEach(_0x2aeac2 => _0x2aeac2.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
mainNav.querySelectorAll("button.nav-link-btn").forEach(_0x2e24c5 => _0x2e24c5.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
document.addEventListener("click", _0x1d3c62 => {
  if (!mainNav.classList.contains("open")) {
    return;
  }
  if (mainNav.contains(_0x1d3c62.target) || menuToggle.contains(_0x1d3c62.target)) {
    return;
  }
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
});
const navCustomerCare = document.getElementById("navCustomerCare");
if (navCustomerCare) {
  navCustomerCare.addEventListener("click", _0x288590 => {
    _0x288590.preventDefault();
    const _0x1ebf30 = document.getElementById("utilCustomerCare");
    if (_0x1ebf30) {
      _0x1ebf30.click();
    }
  });
}
const navShareSite = document.getElementById("navShareSite");
if (navShareSite) {
  navShareSite.addEventListener("click", () => {
    const _0x5575b9 = document.getElementById("utilShareSite");
    if (_0x5575b9) {
      _0x5575b9.click();
    }
  });
}
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", _0x19fe26 => {
  _0x19fe26.preventDefault();
  deferredInstallPrompt = _0x19fe26;
});
const navInstallApp = document.getElementById("navInstallApp");
if (navInstallApp) {
  navInstallApp.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      showSiteToast("ব্রাউজার মেনু থেকে \"হোম স্ক্রিনে যোগ করুন\" / \"Install App\" অপশনে ট্যাপ করে অ্যাপটি ইনস্টল করুন।", "📲");
    }
  });
}
const couponsModal = document.getElementById("couponsModal");
const couponsModalClose = document.getElementById("couponsModalClose");
const couponsModalContent = document.getElementById("couponsModalContent");
function couponListItemHtml(_0x13a234) {
  const _0x1cc2af = _0x13a234.type === "free_delivery" ? "🚚 ফ্রি ডেলিভারি" : _0x13a234.type === "fixed" ? formatTaka(_0x13a234.value) + " ছাড়" : _0x13a234.value + "% ছাড়";
  const _0x53e2a3 = _0x13a234.productId ? _0x13a234.productName || "একটি নির্দিষ্ট প্রোডাক্ট" : "সব প্রোডাক্ট (পুরো কার্ট)";
  return "\n    <div class=\"coupon-list-item\">\n      <span class=\"coupon-code\">🏷️ " + (_0x13a234.label || "বিশেষ অফার") + "</span>\n      <span class=\"coupon-desc\">" + _0x53e2a3 + " — " + _0x1cc2af + (_0x13a234.minOrder ? ", সর্বনিম্ন অর্ডার " + formatTaka(_0x13a234.minOrder) : "") + "</span>\n      <button type=\"button\" class=\"btn btn-ghost coupon-use-btn\" data-code=\"" + _0x13a234.code + "\" data-pid=\"" + (_0x13a234.productId || "") + "\">ব্যবহার করুন</button>\n    </div>";
}
async function openCouponsModal() {
  if (!COUPONS.length) {
    await loadCoupons();
  }
  const _0x1284ee = new Date().toISOString().slice(0, 10);
  const _0x1a6b0c = COUPONS.filter(_0x3453e7 => _0x3453e7.active !== false && (!_0x3453e7.expiry || _0x3453e7.expiry >= _0x1284ee));
  couponsModalContent.innerHTML = _0x1a6b0c.length ? _0x1a6b0c.map(couponListItemHtml).join("") : "<p class=\"coupons-empty\">এই মুহূর্তে চালু কোনো কুপন নেই।</p>";
  couponsModalContent.querySelectorAll(".coupon-use-btn").forEach(_0x510cf5 => {
    _0x510cf5.addEventListener("click", () => {
      const _0x2778bb = _0x510cf5.dataset.code;
      const _0x3f94c8 = _0x510cf5.dataset.pid;
      closeCouponsModal();
      applyProductCouponFromChip(_0x2778bb, _0x3f94c8 || null, null);
    });
  });
  couponsModal.classList.add("open");
  updateBodyScrollLock();
  layerOpen("coupons", _couponsDom);
}
function _couponsDom() {
  couponsModal.classList.remove("open");
  updateBodyScrollLock();
}
function closeCouponsModal() {
  layerClose("coupons", _couponsDom);
}
const navCoupons = document.getElementById("navCoupons");
if (navCoupons) {
  navCoupons.addEventListener("click", () => openCouponsModal());
}
if (couponsModalClose) {
  couponsModalClose.addEventListener("click", closeCouponsModal);
}
if (couponsModal) {
  couponsModal.addEventListener("click", _0x1c9254 => {
    if (_0x1c9254.target === couponsModal) {
      closeCouponsModal();
    }
  });
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
// ===== হোম পেজে ব্যাক বাটন: সাথে সাথে সাইট থেকে বেরিয়ে না গিয়ে আগে সতর্ক করবে =====
// পেজ খোলার সময় history-তে একটা "base" এন্ট্রি + তার উপরে একটা "guard" এন্ট্রি রাখা হয়।
// ব্যাক চাপলে guard থেকে base-এ নামে, তখন আমরা আবার guard বসিয়ে দিই আর টোস্ট দেখাই।
// ২ সেকেন্ডের মধ্যে আবার ব্যাক চাপলে তবেই সত্যিকারের এক্সিট হয়।
(function initBackExitGuard() {
  const cleanUrl = window.location.pathname + window.location.search;
  const startHash = window.location.hash || "";
  let exitArmed = false;
  let armTimer = null;
  try {
    history.replaceState({ osBase: true }, "", cleanUrl);
    // সরাসরি প্রোডাক্ট লিংক (#product-...) দিয়ে ঢুকলে হ্যাশটা guard-এ রেখে দিচ্ছি, যাতে প্রোডাক্ট মডাল আগের মতোই খোলে
    history.pushState({ osGuard: true }, "", cleanUrl + startHash);
  } catch (e) {
    return;
  }
  window.addEventListener("popstate", function () {
    const st = history.state;
    if (!st || !st.osBase) {
      return;
    }
    if (document.body.classList.contains("ws-open")) {
      // স্বাগতম শিট খোলা থাকলে ব্যাক শুধু শিট বন্ধ করবে — এক্সিট টোস্ট দেখাবে না
      try {
        history.pushState({ osGuard: true }, "", cleanUrl);
      } catch (e) {}
      return;
    }
    if (exitArmed) {
      // দ্বিতীয়বার ব্যাক — এবার সত্যিই বের হতে দিচ্ছি
      clearTimeout(armTimer);
      history.back();
      return;
    }
    try {
      history.pushState({ osGuard: true }, "", cleanUrl);
    } catch (e) {
      return;
    }
    exitArmed = true;
    clearTimeout(armTimer);
    armTimer = setTimeout(function () {
      exitArmed = false;
    }, 2000);
    try {
      showSiteToast("সাইট থেকে বের হতে আবার ব্যাক চাপুন", "👋");
    } catch (e) {}
  });
})();
(async function init() {
  applyDarkMode(localStorage.getItem("openshop_dark_mode") === "1");
  renderWishlistCount();
  renderSiteLikeUI();
  await Promise.all([loadLiveProducts(), loadSiteSettings(), loadFlashConfig()]);
  applyFlashPricing();
  syncCartPrices();
  renderCategories();
  renderProducts();
  initHeroSlider();
  renderCart();
  renderFlashSale();
  renderRecentlyViewed();
  markReveal(document.querySelectorAll(".about-card, .faq-item, .section-head"), 0.06);
  logEvent("pageview", {
    path: window.location.pathname
  });
  captureVisitorLocation();
  openProductFromHash(true);
  Promise.all([loadCoupons(), loadReviews(), loadLikes(), loadSiteLikesCount()]).then(() => {
    renderSiteLikeUI();
    renderProducts();
    renderVoucherStrip();
  });
})();
function openProductFromHash(_0x2eb41b) {
  const _0x1c14ee = window.location.hash || "";
  if (!_0x1c14ee.startsWith("#product-")) {
    return;
  }
  const _0x2bb581 = _0x1c14ee.replace("#product-", "");
  if (!PRODUCTS.find(_0x1d800d => _0x1d800d.id === _0x2bb581)) {
    return;
  }
  if (_0x2eb41b) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    openModal(_0x2bb581);
  } else {
    openModal(_0x2bb581, {
      updateUrl: false
    });
  }
}
window.addEventListener("hashchange", () => openProductFromHash(false));
window.addEventListener("popstate", () => {
  if (window.__bkSkipProduct) {
    window.__bkSkipProduct = false;
    return;
  }
  const _0x2bc609 = window.location.hash || "";
  if (_0x2bc609.startsWith("#product-")) {
    const _0x3fadf5 = _0x2bc609.replace("#product-", "");
    if (PRODUCTS.find(_0x2b4ac9 => _0x2b4ac9.id === _0x3fadf5)) {
      openModal(_0x3fadf5, {
        updateUrl: false
      });
    }
  } else if (productModal.classList.contains("open")) {
    productModal.classList.remove("open");
    updateBodyScrollLock();
  }
});
// ===== ঢোকার সময় স্বাগতম শিট: লোকেশন + নাম/ফোন =====
// আগে পেজ খোলার সাথে সাথে অটো-পপআপ চাওয়া হতো (ব্রাউজার অনেক সময় এটা ব্লক করে/ইগনোর করে)। এখন সুন্দর একটা শিটে
// "লোকেশন দিন" বাটন — ইউজার ট্যাপ করলে তবেই ব্রাউজার পারমিশন চায়, তাই Allow করলে নিশ্চিতভাবে কাজ করে।
(function initWelcomeSheet() {
  const ov = document.getElementById("welcomeOverlay");
  if (!ov) {
    return;
  }
  const nameI = document.getElementById("wsName");
  const phoneI = document.getElementById("wsPhone");
  const errEl = document.getElementById("welcomeError");
  const saveB = document.getElementById("welcomeSave");
  const skipB = document.getElementById("welcomeSkip");
  const fieldsEl = document.getElementById("wsFields");
  const titleEl = document.getElementById("welcomeTitle");
  const descEl = document.getElementById("welcomeDesc");
  let needInfo = true;
  let autoCloseTimer = null;
  // ব্যাক বাটন চাপলে সাইট থেকে বেরিয়ে না গিয়ে শুধু শিট বন্ধ হবে — তাই শিট খোলার সময় একটা হিস্ট্রি এন্ট্রি যোগ করা হয়
  let wsHistPushed = false;
  function openSheet() {
    if (ov.classList.contains("open")) {
      return;
    }
    ov.classList.add("open");
    ov.setAttribute("aria-hidden", "false");
    document.body.classList.add("ws-open");
    // Chrome/Brave: ইউজার পেজে একবারও ট্যাপ না করলে pushState করা এন্ট্রি "skippable" হয়ে যায় — ব্যাক চাপলে সেটা টপকে সাইট থেকেই বেরিয়ে যায়।
    // তাই ইউজার অ্যাক্টিভেশন থাকলে সাথে সাথে, না থাকলে প্রথম ট্যাপ/কীপ্রেসে history এন্ট্রি যোগ করা হয়।
    // ফেসবুক/মেসেঞ্জার ইন-অ্যাপ ব্রাউজারে আগের মতোই সাথে সাথে এন্ট্রি যোগ হয় (সেখানে ব্যাক ঠিকই কাজ করছিল)
    const inApp = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(navigator.userAgent || "");
    if (inApp || navigator.userActivation && navigator.userActivation.hasBeenActive) {
      pushWsHistory();
    } else {
      armWsHistoryOnGesture();
    }
  }
  function pushWsHistory() {
    if (wsHistPushed || !ov.classList.contains("open")) {
      return;
    }
    try {
      history.pushState({
        wsSheet: true
      }, "", window.location.href);
      wsHistPushed = true;
    } catch (e) {}
  }
  function armWsHistoryOnGesture() {
    const evs = ["pointerup", "touchend", "mousedown", "keydown"];
    const handler = () => {
      evs.forEach(ev => document.removeEventListener(ev, handler, true));
      pushWsHistory();
    };
    evs.forEach(ev => document.addEventListener(ev, handler, true));
  }
  function closeSheet(skipped, fromPop) {
    ov.classList.remove("open");
    ov.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ws-open");
    if (wsHistPushed) {
      wsHistPushed = false;
      if (!fromPop) {
        histBack("other");
      }
    }
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    if (skipped) {
      try {
        sessionStorage.setItem("openshop_welcome_skip", "1");
      } catch (e) {}
    }
  }
  function readSaved() {
    let n = "";
    let p = "";
    try {
      const c = typeof getSavedCustomer === "function" ? getSavedCustomer() : null;
      n = c && c.name || "";
      p = c && c.phone || localStorage.getItem("openshop_profile_phone") || "";
    } catch (e) {}
    return {
      n,
      p
    };
  }
  const saved = readSaved();
  needInfo = !(saved.n && saved.p);
  nameI.value = saved.n;
  phoneI.value = saved.p;
  if (!needInfo) {
    fieldsEl.hidden = true;
    titleEl.textContent = "লোকেশন চালু করুন";
    descEl.textContent = "সঠিক জায়গায় দ্রুত ডেলিভারির জন্য আপনার লোকেশন দরকার।";
    saveB.textContent = "ঠিক আছে";
  }
  // লোকেশন পেলে: নাম/ফোন আগে থেকেই থাকলে শিট নিজে থেকে বন্ধ হয়ে যায়
  const mo = new MutationObserver(() => {
    const card = ov.querySelector("[data-loc-card]");
    if (card && card.dataset.state === "ok" && ov.classList.contains("open") && !needInfo) {
      autoCloseTimer = setTimeout(() => closeSheet(false), 1100);
    }
  });
  const cardEl = ov.querySelector("[data-loc-card]");
  if (cardEl) {
    mo.observe(cardEl, {
      attributes: true,
      attributeFilter: ["data-state"]
    });
  }
  saveB.addEventListener("click", () => {
    if (!needInfo) {
      closeSheet(false);
      return;
    }
    const n = nameI.value.trim();
    const v = phoneI.value.trim();
    errEl.textContent = "";
    nameI.classList.remove("invalid");
    phoneI.classList.remove("invalid");
    if (typeof isValidLeadName === "function" && !isValidLeadName(n)) {
      errEl.textContent = "সঠিক নাম দিন (শুধু অক্ষর, অন্তত ২ অক্ষর)";
      nameI.classList.add("invalid");
      nameI.focus();
      return;
    }
    if (typeof isValidBDPhone === "function" && !isValidBDPhone(v)) {
      errEl.textContent = "সঠিক ১১ ডিজিটের নম্বর দিন (যেমন 01712345678)";
      phoneI.classList.add("invalid");
      phoneI.focus();
      return;
    }
    const ph = typeof normalizePhone === "function" ? normalizePhone(v) : v;
    try {
      localStorage.setItem("openshop_profile_phone", ph);
      const old = typeof getSavedCustomer === "function" && getSavedCustomer() || {};
      saveCustomer({
        ...old,
        name: n,
        phone: ph
      });
    } catch (e) {}
    try {
      logEvent("visitor_contact", {
        name: n,
        phone: ph
      });
    } catch (e) {}
    [["leadName", n], ["leadPhone", ph]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && !el.value) {
        el.value = val;
      }
    });
    needInfo = false;
    closeSheet(false);
    showSiteToast("ধন্যবাদ! তথ্য সেভ হয়েছে", "✅");
  });
  window.addEventListener("popstate", () => {
    if (ov.classList.contains("open")) {
      closeSheet(true, true);
    }
  });
  skipB.addEventListener("click", () => closeSheet(true));
  ov.addEventListener("click", e => {
    if (e.target === ov) {
      closeSheet(true);
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && ov.classList.contains("open")) {
      closeSheet(true);
    }
  });
  [nameI, phoneI].forEach(i => i.addEventListener("input", () => {
    i.classList.remove("invalid");
    errEl.textContent = "";
  }));
  // শিট কখন দেখাবো
  let skipped = false;
  try {
    skipped = !!sessionStorage.getItem("openshop_welcome_skip");
  } catch (e) {}
  function decide(permState) {
    const cached = loadLocationCache();
    if (cached && !visitorLocation) {
      visitorLocation = cached;
    }
    if (visitorLocation) {
      setLocUI("ok");
    } else if (permState === "granted") {
      captureVisitorLocation(() => {}, () => {});
    } else if (permState === "denied") {
      setLocUI("denied");
    }
    const geoSupported = "geolocation" in navigator && window.isSecureContext !== false;
    if (!geoSupported) {
      setLocUI("unsupported");
    }
    const needLoc = !visitorLocation && permState !== "granted";
    if ((needInfo || needLoc) && !skipped) {
      // ফেসবুক ব্রাউজারে "লিংক কপি করুন" পপআপ খোলা থাকলে শিট এখন খুলবে না — দুটো একসাথে থাকলে এক ব্যাকে দুটোই সরে যেত।
      // পপআপ বন্ধ হলে তারপর শিট খুলবে।
      const tryOpen = () => {
        if (document.getElementById("extBrowserPopup")) {
          setTimeout(tryOpen, 400);
          return;
        }
        openSheet();
      };
      setTimeout(tryOpen, 700);
    }
  }
  try {
    if (navigator.permissions && navigator.permissions.query && "geolocation" in navigator) {
      navigator.permissions.query({
        name: "geolocation"
      }).then(st => {
        decide(st.state);
        // সেটিংস থেকে Allow করে ফিরলে নিজে থেকেই লোকেশন নেয়
        st.onchange = () => {
          if (st.state === "granted") {
            captureVisitorLocation(() => {}, () => {});
          }
        };
      }).catch(() => decide("unknown"));
    } else {
      decide("unknown");
    }
  } catch (e) {
    decide("unknown");
  }
})();

// ?track=OSxxxx লিংকে ঢুকলে সরাসরি অর্ডার ট্র্যাকিং খুলে যায়; আর নিজের অর্ডারের স্ট্যাটাস বদলালে টোস্ট আসে
(function initTrackingExtras() {
  try {
    if (new URLSearchParams(window.location.search).get("track")) {
      setTimeout(openProfile, 600);
    }
  } catch (e) {}
  setTimeout(watchMyOrdersForToast, 2500);
})();


/* ===== ছবি লোড না হওয়ার সমাধান (বিশেষ করে ফেসবুক/মেসেঞ্জার ইন-অ্যাপ ব্রাউজারে) =====
   ১) ফেসবুক ইন-অ্যাপ ব্রাউজারে lazy-loading ঠিকমতো ট্রিগার হয় না — তাই সেখানে সব ছবি eager লোড হবে।
   ২) ছবি ফেল করলে সাথে সাথে placeholder না দিয়ে আগে ২ বার নতুন করে চেষ্টা করা হয় (ক্যাশ-বাস্টার সহ),
      তারপর imgbb-র বদলে একটা ইমেজ প্রক্সি দিয়ে, সবশেষে placeholder।
   ৩) লোড হচ্ছে না এমন ছবি ৫ সেকেন্ড পর পর্যন্ত নজর রেখে আবার চেষ্টা করা হয় (ওয়াচডগ)। */
(function imageResilience() {
  const _ua = navigator.userAgent || "";
  const _inFb = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(_ua);
  const _isData = _u => !_u || _u.indexOf("data:") === 0 || _u.indexOf("blob:") === 0;
  function _stage(_img) { return Number(_img.dataset.retry || 0); }
  function _retry(_img) {
    const _orig = _img.dataset.origSrc || _img.getAttribute("src");
    if (_isData(_orig)) return false;
    if (!_img.dataset.origSrc) _img.dataset.origSrc = _orig;
    const _n = _stage(_img);
    if (_n >= 3) return false;
    _img.dataset.retry = String(_n + 1);
    _img.removeAttribute("loading");
    if (_n < 2) {
      _img.src = _orig + (_orig.indexOf("?") > -1 ? "&" : "?") + "r=" + Date.now() + _n;
    } else {
      _img.src = "https://images.weserv.nl/?url=" + encodeURIComponent(_orig.replace(/^https?:\/\//, ""));
    }
    return true;
  }
  document.addEventListener("error", _e => {
    const _t = _e.target;
    if (!_t || _t.tagName !== "IMG") return;
    if (_t.src && _t.src.indexOf("data:image/svg+xml") === 0) return;
    _t.onerror = null; // পুরনো inline onerror (সরাসরি placeholder) বন্ধ, এখন এই রিট্রাই লজিক চলবে
    if (!_retry(_t)) {
      _t.src = PLACEHOLDER_IMG; // সব চেষ্টা ফেল করলে তবেই placeholder
    }
  }, true);
  function _prep(_img) {
    if (_img.tagName !== "IMG") return;
    _img.setAttribute("referrerpolicy", "no-referrer");
    _img.setAttribute("decoding", "async");
    if (_inFb) _img.setAttribute("loading", "eager");
    if (_img.getAttribute("onerror")) _img.removeAttribute("onerror");
  }
  const _mo = new MutationObserver(_muts => {
    _muts.forEach(_m => _m.addedNodes.forEach(_n => {
      if (_n.nodeType !== 1) return;
      if (_n.tagName === "IMG") _prep(_n);
      else if (_n.querySelectorAll) _n.querySelectorAll("img").forEach(_prep);
    }));
  });
  _mo.observe(document.documentElement, { childList: true, subtree: true });
  document.querySelectorAll("img").forEach(_prep);
  // ওয়াচডগ: ৫ সেকেন্ডেও যে ছবি আসেনি সেটা আবার চেষ্টা
  let _runs = 0;
  const _wd = setInterval(() => {
    _runs++;
    document.querySelectorAll("img").forEach(_img => {
      const _s = _img.getAttribute("src");
      if (_isData(_s)) return;
      if (_img.complete && _img.naturalWidth === 0 && _stage(_img) < 3) _retry(_img);
    });
    if (_runs >= 6) clearInterval(_wd);
  }, 5000);
})();

/* ===== ফেসবুক/মেসেঞ্জার ইন-অ্যাপ ব্রাউজারে অর্ডার হয় না — তাই "লিংক কপি করুন" পপআপ ও নিচের বার =====
   যে লিংক দিয়ে ঢুকেছে হুবহু সেটাই (# ও প্যারামিটার সহ) কপি হয়। */
(function fbLinkCopyPrompt() {
  const _ua = navigator.userAgent || "";
  if (!/FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(_ua)) return;
  const _getUrl = () => location.href; // ক্লিকের মুহূর্তের লিংক — প্রোডাক্ট খোলা থাকলে সেই প্রোডাক্টের লিংক
  function _copy(_done) {
    const _fallback = () => {
      try {
        const _ta = document.createElement("textarea");
        _ta.value = _getUrl();
        _ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
        document.body.appendChild(_ta);
        _ta.focus();
        _ta.select();
        _ta.setSelectionRange(0, 99999);
        const _ok = document.execCommand("copy");
        _ta.remove();
        _done(_ok);
      } catch (_e) {
        _done(false);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_getUrl()).then(() => _done(true)).catch(_fallback);
    } else {
      _fallback();
    }
  }
  function _wire(_btn, _okText) {
    _btn.addEventListener("click", () => {
      _copy(_ok => {
        _btn.textContent = _ok ? _okText : "কপি হয়নি — নিচের লিংক চেপে ধরে কপি করুন";
        if (!_ok && !document.getElementById("extLinkBox")) {
          const _i = document.createElement("input");
          _i.id = "extLinkBox";
          _i.type = "text";
          _i.readOnly = true;
          _i.value = _getUrl();
          _i.style.cssText = "width:100%;margin-top:8px;padding:9px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;color:#1B2547;";
          _i.addEventListener("focus", () => _i.select());
          _btn.parentNode.appendChild(_i);
        }
      });
    });
  }
  // --- বড় পপআপ ---
  const _wrap = document.createElement("div");
  _wrap.id = "extBrowserPopup";
  _wrap.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(10,14,30,.72);display:flex;align-items:center;justify-content:center;padding:18px;";
  const _card = document.createElement("div");
  _card.style.cssText = "background:#fff;color:#1B2547;border-radius:16px;max-width:360px;width:100%;padding:20px 18px;text-align:center;line-height:1.7;box-shadow:0 12px 40px rgba(0,0,0,.35);";
  _card.innerHTML = "<div style=\"font-size:34px;\">🛍️</div>" +
    "<p style=\"margin:0 0 14px;font-size:14px;\">আপনি চাইলে এখানেই সব প্রোডাক্ট ঘুরে দেখতে পারেন। অর্ডার করার সময় ফেসবুকের ভেতরে সমস্যা হয়, তাই তখন লিংক কপি করে আপনার ব্রাউজারে (যেমন Chrome, Samsung Internet, Opera, Safari) গিয়ে পেস্ট করুন।</p>";
  const _copyBtn = document.createElement("button");
  _copyBtn.type = "button";
  _copyBtn.textContent = "🔗 লিংক কপি করুন";
  _copyBtn.style.cssText = "width:100%;background:#1B2547;color:#fff;border:0;border-radius:10px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;";
  _wire(_copyBtn, "✅ কপি হয়েছে — এখন আপনার ব্রাউজারে পেস্ট করুন");
  _card.appendChild(_copyBtn);
  const _later = document.createElement("button");
  _later.type = "button";
  _later.textContent = "ঠিক আছে, ঘুরে দেখি";
  _later.style.cssText = "display:block;margin:12px auto 0;background:none;border:0;color:#6b7686;font-size:12.5px;text-decoration:underline;cursor:pointer;";
  // ব্যাক বাটনেও এই পপআপ বন্ধ হবে (সাইট থেকে বেরিয়ে যাবে না)
  const _closeExtPopup = () => _wrap.remove();
  _later.addEventListener("click", () => layerClose("extPopup", _closeExtPopup));
  _card.appendChild(_later);
  _wrap.appendChild(_card);
  document.body.appendChild(_wrap);
  layerOpen("extPopup", _closeExtPopup);
  // --- নিচের বার (পপআপ বন্ধ করলেও থাকবে) ---
  const _bar = document.createElement("div");
  _bar.id = "extBrowserBar";
  _bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#1B2547;color:#fff;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 16px rgba(0,0,0,.25);font-size:13px;line-height:1.5;display:flex;align-items:center;gap:10px;";
  const _msg = document.createElement("div");
  _msg.style.flex = "1";
  _msg.textContent = "অর্ডার করতে চাইলে লিংক কপি করে আপনার ব্রাউজারে পেস্ট করুন।";
  const _barBtn = document.createElement("button");
  _barBtn.type = "button";
  _barBtn.textContent = "🔗 লিংক কপি করুন";
  _barBtn.style.cssText = "background:#ffb703;color:#1B2547;border:0;border-radius:8px;padding:9px 12px;font-weight:800;font-size:13px;white-space:nowrap;cursor:pointer;";
  _wire(_barBtn, "✅ কপি হয়েছে");
  _bar.appendChild(_msg);
  _bar.appendChild(_barBtn);
  document.body.appendChild(_bar);
  // বারটা নিচের ন্যাভ (হোম/বিভাগ/কার্ট...) ঢেকে দিচ্ছিল — এখন ন্যাভের ঠিক উপরে বসে, আর বাড়তি ফাঁকা জায়গাও মাপ মতো হয়
  function _layoutExtBar() {
    const _nav = document.querySelector(".bottom-nav");
    const _navH = _nav && getComputedStyle(_nav).display !== "none" ? _nav.offsetHeight : 0;
    _bar.style.bottom = _navH + "px";
    _bar.style.paddingBottom = "10px";
    _bar.style.zIndex = "75";
    document.body.style.paddingBottom = (_navH + _bar.offsetHeight + 8) + "px";
    const _fl = document.querySelector(".float-btn-stack");
    if (_fl) {
      _fl.style.bottom = (_navH + _bar.offsetHeight + 16) + "px";
    }
  }
  _layoutExtBar();
  window.addEventListener("resize", _layoutExtBar);
  window.addEventListener("load", _layoutExtBar);
  setTimeout(_layoutExtBar, 600);
  setTimeout(_layoutExtBar, 2000);
})();

/* মেসেঞ্জারে অর্ডার পাঠানো: m.me লিংকে আগে থেকে লেখা মেসেজ বসানো যায় না (Facebook অনুমতি দেয় না),
   তাই অর্ডারের মেসেজ কপি করে মেসেঞ্জার চ্যাট খোলা হয় — ক্রেতা শুধু পেস্ট করে সেন্ড দেবেন। */
(function(){
  const btn = document.getElementById("reopenMsgrBtn");
  if(!btn) return;
  btn.addEventListener("click", () => {
    if(!lastOrder || !lastOrder.msg) return;
    const pid = window.MESSENGER_PAGE_ID_OVERRIDE || (typeof MESSENGER_PAGE_ID !== "undefined" ? MESSENGER_PAGE_ID : "");
    if(!pid) return;
    let copied = false;
    try{
      const t = document.createElement("textarea");
      t.value = lastOrder.msg; t.setAttribute("readonly","");
      t.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, t.value.length);
      copied = document.execCommand("copy");
      t.remove();
    }catch(e){}
    if(!copied && navigator.clipboard){ navigator.clipboard.writeText(lastOrder.msg).catch(()=>{}); copied = true; }
    btn.textContent = copied ? "✅ মেসেজ কপি হয়েছে — মেসেঞ্জারে পেস্ট করে সেন্ড দিন" : "মেসেঞ্জার খুলছে…";
    window.open("https://m.me/" + pid, "_blank");
  });
})();

/* ব্যাকগ্রাউন্ড প্রি-লোড: কেউ কিছু না ছুঁলেও সব প্রোডাক্টের ছবি ফোনে জমিয়ে রাখা হয় */
(function(){
  if(!("serviceWorker" in navigator)) return;
  function collect(){
    const set = new Set();
    try{ (PRODUCTS || []).forEach(p => getAllImages(p).forEach(u => u && set.add(u))); }catch(e){}
    document.querySelectorAll("img[src]").forEach(i => set.add(i.src));
    return [...set].filter(u => /^https?:/.test(u)).slice(0, 600);
  }
  function run(){
    const c = navigator.connection;
    if(c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return;
    navigator.serviceWorker.ready.then(reg => { if(reg.active) reg.active.postMessage({ type: "PRECACHE_IMAGES", urls: collect() }); }).catch(() => {});
  }
  window.addEventListener("load", () => {
    const go = () => { setTimeout(run, 4000); setTimeout(run, 16000); };
    if("requestIdleCallback" in window) requestIdleCallback(go, { timeout: 8000 }); else go();
  });
})();
