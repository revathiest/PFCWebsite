const apiBase = 'https://api.pyrofreelancercorps.com';

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
  return endStr ? `${startStr} – ${endStr}` : `${startStr}`;
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
    const res = await fetch(`${apiBase}/api/events`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { events } = await res.json();

    if (!Array.isArray(events) || events.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No upcoming events found.</p>';
      return;
    }

    container.innerHTML = events.map(event => {
      const dateRange = formatDateRange(event.start_time, event.end_time);
      const descriptionHTML = formatDescription(event.description || '');
      return `
        <div class="card text-left">
          <h3>${event.name}</h3>
          <div class="meta">
            <time>${dateRange}</time>
            <span class="badge">${event.status || 'Scheduled'}</span>
          </div>
          ${descriptionHTML}
          <p class="text-sm text-gray-500"><strong>Location:</strong> ${event.location || 'TBD'}<br>
          <strong>Coordinator:</strong> ${event.event_coordinator || 'TBD'}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[ERROR] Failed to load events:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load events. Please try again later.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadEvents);
