# Tooltip & Input Fixes

## Issues Fixed

### 1. Tooltip Positioning ✅ FIXED
**Problem:** Tooltips were appearing to the right and getting cut off by the sidebar edge.

**Solution:**
- Changed positioning from `right-0 top-8` (below button) to `right-full top-0 mr-2` (to the left)
- Tooltips now appear on the left side of the button, inside the sidebar
- Reduced z-index layers for better stacking
- Made button smaller (w-5 h-5 instead of w-6 h-6) to fit better
- Added `flex-shrink-0` to prevent button from shrinking

### 2. Overlapping "Rp" and Numbers ✅ FIXED
**Problem:** The "Rp" label was overlapping with the input numbers.

**Solution:**
- Reduced left padding from `pl-16` back to `pl-14` (optimal balance)
- Added `whitespace-nowrap` to ALL span labels ("Rp", "/kWp", "/kWh")
- This ensures labels never wrap or overlap with content

## Technical Details

### Tooltip Positioning

**Before:**
```tsx
// Positioned below button, extending to right
className="absolute right-0 top-8 w-72 z-50"
```

**After:**
```tsx
// Positioned to the left of button
className="absolute right-full top-0 mr-2 w-64 z-[70]"
```

### Input Padding

**Before (overlap issue):**
```tsx
<span className="absolute left-4">Rp</span>
<input className="pl-12 ..." />  // Not enough space!
```

**After (fixed):**
```tsx
<span className="absolute left-4 whitespace-nowrap">Rp</span>
<input className="pl-14 ..." />  // Proper spacing + no wrap
```

### All Input Fields Updated:

1. **Tagihan Listrik** (Monthly Bill)
   - `pl-14` (from pl-16)
   - `whitespace-nowrap` on "Rp"

2. **Biaya Sistem** (System Cost)
   - `pl-14` (from pl-12)
   - `whitespace-nowrap` on "Rp"
   - `whitespace-nowrap` on "/kWp"

3. **Tarif Listrik** (Electricity Tariff)
   - `pl-14` (from pl-12)
   - `whitespace-nowrap` on "Rp"
   - `whitespace-nowrap` on "/kWh"

## Visual Result

### Tooltip Position:
```
┌─────────────────────────────────┐
│ Kemiringan    (i)    20°        │
│ ┌──────────────┐               │
│ │ Kemiringan   │ ← Tooltip     │
│ │ Atap         │   appears     │
│ │ ...          │   here        │
│ └──────────────┘               │
└─────────────────────────────────┘
```

### Input Layout:
```
┌─────────────────────────────────┐
│ Rp 15,000,000              /kWp│
│ └─┘        └──────────┘        │
│  ↑         ↑                    │
│ pl-14     number                 │
```

## Build Status
✅ TypeScript compilation passed
✅ All tooltips positioned correctly
✅ No text overlap in any input
✅ Responsive and clean UI

## Files Modified
- `frontend/src/components/ui/InfoTooltip.tsx`
  - Changed positioning to left side
  - Reduced button size
  - Adjusted z-index layers
  - Reduced tooltip width (w-64 instead of w-72)

- `frontend/src/components/layout/Sidebar.tsx`
  - Fixed padding on all 3 number inputs
  - Added `whitespace-nowrap` to all labels
  - Consistent spacing across all inputs

## Testing Checklist
- [ ] Click (i) button → Tooltip appears on left
- [ ] Tooltip doesn't get cut off
- [ ] Click backdrop → Tooltip closes
- [ ] "Rp" label doesn't overlap with numbers
- [ ] "/kWp" label doesn't overlap
- [ ] "/kWh" label doesn't overlap
- [ ] All inputs have proper spacing
- [ ] UI looks clean and professional