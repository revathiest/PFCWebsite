import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

const CATEGORY_LABELS = {
  ships: 'Ships',
  weapons: 'Weapons',
  armor: 'Armor',
  crafting: 'Crafting',
  mining: 'Mining'
};

function groupByCategory(entries) {
  const byCategory = {};
  for (const entry of entries) {
    (byCategory[entry.category] ||= []).push(entry);
  }
  return byCategory;
}

function groupByRecord(entries) {
  const byRecord = new Map();
  for (const entry of entries) {
    if (!byRecord.has(entry.recordRef)) {
      byRecord.set(entry.recordRef, { recordName: entry.recordName, recordDisplayName: entry.recordDisplayName, fields: [] });
    }
    byRecord.get(entry.recordRef).fields.push(entry);
  }
  return [...byRecord.values()];
}

// Internal record names are raw identifiers (e.g. "AEGS_Avenger_Titan").
// recordDisplayName is the real player-facing name resolved from the game's
// localization table, but plenty of records only have an unassigned-
// localization placeholder there, so it's null for those — fall back to a
// cosmetic cleanup of the raw name rather than showing nothing.
function humanizeName(name) {
  return name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function displayNameFor(record) {
  return record.recordDisplayName || humanizeName(record.recordName);
}

// null means "this side doesn't exist" (an added or removed record/field),
// not a real value of nothing — render it as N/A, not the literal word
// "null" or a value that could be mistaken for a real reading of zero.
function formatValue(value, unit) {
  if (value === null || value === undefined) return 'N/A';
  return `${value}${unit ? ` ${unit}` : ''}`;
}

// One table row per record, always visible — no accordion. Every field
// change for that record is consolidated into a single compact grid inside
// the row's "Changes" cell instead of repeating the item name per field, so
// a record with 10 changes doesn't cost 10 rows and one with 1 change
// doesn't cost an extra click to see it.
//
// Previous/Current use a FIXED width (not auto) — each record renders its
// own independent grid, so auto-sizing lines up within one record but not
// down the table, since every item's "auto" column resolves to whatever fits
// that item's own values. A fixed width keeps every item's columns aligned
// with every other item's, and is wide enough for the longest real value
// seen in the data (e.g. "43.65 /shot") without wrapping.
const CHANGE_GRID_COLS = 'grid-cols-[1fr_5.5rem_5.5rem]';

function renderTableRow(record) {
  const fieldRows = record.fields.map(f => `
    <div class="text-gray-400">${f.label}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${formatValue(f.oldValue, f.unit)}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${formatValue(f.newValue, f.unit)}</div>
  `).join('');

  return `
    <tr class="border-t border-gray-800">
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">${displayNameFor(record)}</td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${CHANGE_GRID_COLS} gap-x-3 gap-y-0.5 text-sm">
          ${fieldRows}
        </div>
      </td>
    </tr>
  `;
}

function renderCategoryTable(records) {
  return `
    <div class="rounded-lg bg-gray-900/60 overflow-x-auto border border-gray-800">
      <table class="w-full text-sm border-collapse table-fixed">
        <thead>
          <tr class="text-left text-gray-500 uppercase text-xs border-b border-gray-800">
            <th class="w-[30%] px-3 py-1.5 font-semibold border-r border-gray-800">Item</th>
            <th class="px-3 py-1.5 font-semibold">
              <div class="grid ${CHANGE_GRID_COLS} gap-x-3">
                <span>Parameter</span>
                <span class="text-right">Previous</span>
                <span class="text-right">Current</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          ${records.map(renderTableRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// One tab per category instead of one long stacked list — only the active
// category's table is shown at a time. A <select> covers narrow screens
// (swapped in below the `sm` breakpoint) since a horizontal tab strip with
// five-plus labels doesn't fit a phone width; the tab strip covers `sm` and
// up. Both controls drive the same activateChangelogTab() so they always
// agree on which panel is showing.
function renderResults(versionFrom, versionTo, entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return versionFrom && versionTo
      ? `<p class="text-gray-400 mb-4">${versionFrom} &rarr; ${versionTo}</p><p class="text-gray-300">No tracked changes between these versions.</p>`
      : '<p class="text-gray-300">No changelog data available yet.</p>';
  }

  const byCategory = groupByCategory(entries);
  const tabs = Object.keys(byCategory).sort().map(category => ({
    category,
    label: CATEGORY_LABELS[category] || category,
    records: groupByRecord(byCategory[category]),
  }));

  const tabOptions = tabs.map(t => `<option value="${t.category}">${t.label} (${t.records.length})</option>`).join('');

  const tabButtons = tabs.map((t, i) => `
    <button type="button" data-changelog-tab="${t.category}" class="changelog-tab-btn px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${i === 0 ? 'border-pfc-gold text-pfc-gold' : 'border-transparent text-gray-400 hover:text-gray-200'}">
      ${t.label} <span class="text-gray-500 font-normal">(${t.records.length})</span>
    </button>
  `).join('');

  const panels = tabs.map((t, i) => `
    <div data-changelog-panel="${t.category}" class="changelog-tab-panel${i === 0 ? '' : ' hidden'}">
      ${renderCategoryTable(t.records)}
    </div>
  `).join('');

  const subtitle = `<p class="text-gray-400 mb-4 text-center">${versionFrom} &rarr; ${versionTo}</p>`;

  return `
    ${subtitle}
    <div class="sm:hidden mb-4">
      <select id="changelog-tab-select" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200">
        ${tabOptions}
      </select>
    </div>
    <div class="hidden sm:flex flex-wrap gap-1 border-b border-gray-800 mb-5" role="tablist">
      ${tabButtons}
    </div>
    <div>${panels}</div>
  `;
}

function activateChangelogTab(container, category) {
  container.querySelectorAll('[data-changelog-panel]').forEach(panel => {
    panel.classList.toggle('hidden', panel.dataset.changelogPanel !== category);
  });
  container.querySelectorAll('.changelog-tab-btn').forEach(btn => {
    const active = btn.dataset.changelogTab === category;
    btn.classList.toggle('border-pfc-gold', active);
    btn.classList.toggle('text-pfc-gold', active);
    btn.classList.toggle('border-transparent', !active);
    btn.classList.toggle('text-gray-400', !active);
  });
  const select = container.querySelector('#changelog-tab-select');
  if (select) select.value = category;
}

function bindChangelogTabs(container) {
  container.querySelectorAll('.changelog-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => activateChangelogTab(container, btn.dataset.changelogTab));
  });
  const select = container.querySelector('#changelog-tab-select');
  if (select) {
    select.addEventListener('change', () => activateChangelogTab(container, select.value));
  }
}

async function loadChangelog(from, to) {
  const results = document.getElementById('changelog-results');
  try {
    const url = new URL(`${PFC_CONFIG.apiBase}/api/sc-changelog`);
    if (from) url.searchParams.set('from', from);
    if (to) url.searchParams.set('to', to);
    const apiUrl = url.toString();
    if (DEBUG) console.log('[changelog] Fetching from:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    const { versionFrom, versionTo, entries } = await res.json();
    results.classList.add('text-left');
    results.innerHTML = renderResults(versionFrom, versionTo, entries);
    bindChangelogTabs(results);
  } catch (err) {
    console.error('[changelog] Failed to load changelog:', err);
    results.innerHTML = '<p class="text-red-500">Failed to load changelog. Please try again later.</p>';
  }
}

// Version picker — lets you compare any two tracked versions, not just the
// latest pair. Hidden entirely until there are at least two known versions
// to pick from (fewer than that, there's nothing to compare yet anyway).
async function loadVersionPicker() {
  const picker = document.getElementById('changelog-picker');
  try {
    const apiUrl = `${PFC_CONFIG.apiBase}/api/sc-changelog/known-versions`;
    if (DEBUG) console.log('[changelog] Fetching known versions from:', apiUrl);

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { versions } = await res.json();
    if (!Array.isArray(versions) || versions.length < 2) {
      picker.innerHTML = '';
      return;
    }

    const options = versions.map(v => `<option value="${v}">${v}</option>`).join('');
    picker.innerHTML = `
      <div class="flex flex-wrap items-end justify-center gap-3 mb-6 text-sm">
        <label class="flex flex-col items-start text-gray-400">
          From
          <select id="changelog-from" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${options}</select>
        </label>
        <label class="flex flex-col items-start text-gray-400">
          To
          <select id="changelog-to" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${options}</select>
        </label>
        <button id="changelog-compare" type="button" class="btn">Compare</button>
      </div>
    `;

    document.getElementById('changelog-from').value = versions[versions.length - 2];
    document.getElementById('changelog-to').value = versions[versions.length - 1];

    document.getElementById('changelog-compare').addEventListener('click', () => {
      const from = document.getElementById('changelog-from').value;
      const to = document.getElementById('changelog-to').value;
      loadChangelog(from, to);
    });
  } catch (err) {
    console.error('[changelog] Failed to load version picker:', err);
    picker.innerHTML = '';
  }
}

export async function init() {
  const container = document.getElementById('changelog');
  container.innerHTML = `
    <div id="changelog-picker"></div>
    <div id="changelog-results"></div>
  `;
  try {
    await Promise.all([loadVersionPicker(), loadChangelog()]);
  } catch (err) {
    console.error('[changelog] Failed to load site content:', err);
  }
}
