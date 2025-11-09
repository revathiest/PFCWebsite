import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

function formatDateRange(start, end) {
  const options = {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  const startStr = new Date(start).toLocaleString(undefined, options);
  const endStr = end && new Date(end).getFullYear() > 1970
    ? new Date(end).toLocaleString(undefined, options)
    : '';
  return endStr ? `${startStr} - ${endStr}` : `${startStr}`;
}

function formatDescription(text) {
  return text
    .split('\n')
    .map(line => `<p class="mb-2">${line.trim()}</p>`)
    .join('');
}

async function loadEvents() {
  const container = document.getElementById('events');
  try {
    const apiUrl = `${PFC_CONFIG.apiBase}/api/events`;
    if (DEBUG) console.log('[events] Fetching from:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    const { events } = await res.json();

    if (!Array.isArray(events) || events.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No upcoming events found.</p>';
      return;
    }

    container.classList.add('flex', 'flex-col', 'gap-6');

    container.innerHTML = events.map(event => {
      const dateRange = formatDateRange(event.start_time, event.end_time);
      const descriptionHTML = formatDescription(event.description || '');

      return `
        <div class="card w-full mb-6 border-l-4 border-pfc-red animate-fade-in">
          <div class="text-pfc-gold font-semibold text-sm mb-2 uppercase tracking-wide">
            ${new Date(event.start_time).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <h3 class="text-2xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">
            ${event.name}
          </h3>
          <div class="text-sm text-gray-400 mb-4">
            <time>${dateRange}</time> 
            <span class="ml-2 px-2 py-1 rounded bg-gray-800 text-xs uppercase">${event.status || 'Scheduled'}</span>
          </div>
          <div class="text-gray-300 mb-4">${descriptionHTML}</div>
          <p class="text-sm text-gray-500">
            <strong>Location:</strong> ${event.location || 'TBD'}<br>
            <strong>Coordinator:</strong> ${event.event_coordinator || 'TBD'}
          </p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[events] Failed to load events:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load events. Please try again later.</p>';
  }
}

export async function init() {
  try {
    await loadEvents();
  } catch (err) {
    console.error('[events] Failed to load site content:', err);
  }
}
