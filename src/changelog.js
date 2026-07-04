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
      byRecord.set(entry.recordRef, { recordName: entry.recordName, fields: [] });
    }
    byRecord.get(entry.recordRef).fields.push(entry);
  }
  return [...byRecord.values()];
}

// Internal record names are raw identifiers (e.g. "AEGS_Avenger_Titan") —
// this is a cosmetic cleanup, not real display-name resolution (that would
// require pulling the game's localization string tables, a separate data
// source this pipeline doesn't extract yet).
function humanizeName(name) {
  return name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
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
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">${humanizeName(record.recordName)}</td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${CHANGE_GRID_COLS} gap-x-3 gap-y-0.5 text-sm">
          ${fieldRows}
        </div>
      </td>
    </tr>
  `;
}

async function loadChangelog() {
  const container = document.getElementById('changelog');
  try {
    const apiUrl = `${PFC_CONFIG.apiBase}/api/sc-changelog`;
    if (DEBUG) console.log('[changelog] Fetching from:', apiUrl);

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    const { versionFrom, versionTo, entries } = await res.json();

    if (!Array.isArray(entries) || entries.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No changelog data available yet.</p>';
      return;
    }

    container.classList.add('text-left');

    const byCategory = groupByCategory(entries);
    const sections = Object.keys(byCategory).sort().map(category => {
      const records = groupByRecord(byCategory[category]);
      const label = CATEGORY_LABELS[category] || category;
      return `
        <section class="mb-5">
          <h2 class="text-lg font-bold text-pfc-gold uppercase tracking-wide mb-1.5">
            ${label} <span class="text-gray-500 text-sm font-normal normal-case">(${records.length})</span>
          </h2>
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
        </section>
      `;
    }).join('');

    const subtitle = versionFrom && versionTo
      ? `<p class="text-gray-400 mb-4 text-center">${versionFrom} &rarr; ${versionTo}</p>`
      : '';

    container.innerHTML = subtitle + sections;
  } catch (err) {
    console.error('[changelog] Failed to load changelog:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load changelog. Please try again later.</p>';
  }
}

export async function init() {
  try {
    await loadChangelog();
  } catch (err) {
    console.error('[changelog] Failed to load site content:', err);
  }
}
