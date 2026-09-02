import './style.css';
import imageDataUri from './assets/image.webp?inline';
import { CONFIG } from './config.js';

const picture = document.getElementById('picture');
const iframe = document.getElementById('gf');

picture.src = imageDataUri;

function isConfigured() {
  return ![
    CONFIG.googleFormUrl,
    CONFIG.fieldIp,
    CONFIG.fieldUserAgent
  ].some((value) => value.includes('REPLACE_WITH_'));
}

async function sendAnalytics() {
  try {
    if (!isConfigured()) {
      return;
    }

    const ipResponse = await fetch(CONFIG.ipApi, {
      method: 'GET',
      cache: 'no-store'
    });

    let ip = '';

    if (ipResponse.ok) {
      ip = await ipResponse.text();
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = CONFIG.googleFormUrl;
    form.target = 'gf';
    form.style.display = 'none';

    const addField = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addField(CONFIG.fieldIp, ip);
    addField(CONFIG.fieldUserAgent, navigator.userAgent);

    document.body.appendChild(form);

    let completed = false;

    const complete = () => {
      if (completed) return;
      completed = true;
      form.remove();
    };

    iframe.addEventListener(
      'load',
      () => complete(),
      { once: true }
    );

    form.submit();

    setTimeout(
      () => complete(),
      CONFIG.submissionTimeoutMs
    );
  } catch (error) {
    console.error(error);
  }
}

sendAnalytics();
