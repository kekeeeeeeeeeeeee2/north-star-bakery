"use strict";
/* Touchstone 4: favorites are an array of product IDs; product metadata is an object. */
const PRODUCTS = {
  signature: "Signature Loaf",
  favorites: "Bakery Favorites",
  pastries: "Fresh Pastries"
};
const FAVORITES_KEY = "northStarBakeryFavorites_v1";

function initializeNavigation() {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#navigation");
  if (!menuButton || !nav) return;
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
}

function initializeAudio(buttonId, audioId, label) {
  const button = document.getElementById(buttonId);
  const audio = document.getElementById(audioId);
  if (!button || !audio) return;
  button.addEventListener("click", async () => {
    if (audio.paused) {
      document.querySelectorAll("audio").forEach(other => { if (other !== audio) other.pause(); });
      try { await audio.play(); button.textContent = "❚❚ Pause " + label; }
      catch { button.textContent = "Audio unavailable"; }
    } else { audio.pause(); button.textContent = "▶ Play " + label; }
  });
  audio.addEventListener("ended", () => { button.textContent = "▶ Play " + label; });
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(id => Object.hasOwn(PRODUCTS, id)) : [];
  } catch { return []; }
}
function storeFavorites(favorites) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); return true; }
  catch { return false; }
}
function initializeFavorites() {
  const buttons = [...document.querySelectorAll(".favorite-button")];
  if (!buttons.length) return;
  const list = document.getElementById("favorites-list");
  const notice = document.getElementById("storage-notice");
  const clearButton = document.getElementById("clear-favorites");
  let favorites = loadFavorites();
  function renderFavorites() {
    buttons.forEach(button => {
      const selected = favorites.includes(button.dataset.productId);
      button.setAttribute("aria-pressed", String(selected));
      button.textContent = selected ? "♥ Saved — remove" : "♡ Save to favorites";
    });
    list.replaceChildren();
    if (!favorites.length) {
      const item = document.createElement("li"); item.textContent = "No favorites saved yet."; list.append(item);
    } else {
      favorites.forEach(id => {
        const item = document.createElement("li"); item.textContent = PRODUCTS[id]; list.append(item);
      });
    }
    clearButton.disabled = favorites.length === 0;
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.productId;
    favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    notice.textContent = storeFavorites(favorites) ? "Your favorites were saved on this device." : "Your favorites work for this visit, but this browser could not save them.";
    renderFavorites();
  }));
  clearButton.addEventListener("click", () => {
    favorites = []; notice.textContent = storeFavorites(favorites) ? "Saved favorites cleared." : "Favorites cleared for this visit."; renderFavorites();
  });
  renderFavorites();
}

function setFieldError(field, message) {
  const error = document.getElementById(field.getAttribute("aria-describedby"));
  if (error) error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}
function validateInquiry(form) {
  const name = form.elements.namedItem("name");
  const email = form.elements.namedItem("email");
  const message = form.elements.namedItem("message");
  const nameValue = name.value.trim();
  const emailValue = email.value.trim();
  const messageValue = message.value.trim();
  const errors = [
    [name, nameValue.length < 2 ? "Please enter your name (at least 2 characters)." : ""],
    [email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) ? "Please enter a valid email address." : ""],
    [message, messageValue.length < 10 ? "Please write at least 10 characters about your inquiry." : ""]
  ];
  errors.forEach(([field, error]) => setFieldError(field, error));
  return errors.filter(([, error]) => error).map(([field]) => field);
}
function initializeInquiryForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  ["name", "email", "message"].forEach(id => {
    const field = form.elements.namedItem(id);
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateInquiry(form); });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const invalidFields = validateInquiry(form);
    if (invalidFields.length) {
      status.className = "form-status error";
      status.textContent = "Please correct the highlighted fields. No information was sent.";
      invalidFields[0].focus();
      return;
    }
    status.className = "form-status success";
    status.textContent = "Your inquiry passed the checks. This is a preview only: no message was sent or stored.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  initializeAudio("welcome-button", "welcome-audio", "welcome message");
  initializeAudio("mixed-button", "mixed-audio", "bakery audio");
  initializeFavorites();
  initializeInquiryForm();
});
