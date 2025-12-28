# MVP Acceptance Criteria - Quick Reference

## Feature 1: OTP Login/Register + Profile + HN

### OTP Login
- [ ] OTP sent via SMS/dev log within 5 seconds
- [ ] OTP expires in 5 minutes
- [ ] OTP request rate limit: 3/hour per phone
- [ ] OTP verification works (correct code)
- [ ] OTP verification fails (wrong code) with error message
- [ ] Max 5 verification attempts before OTP invalidated
- [ ] JWT token generated on successful verification
- [ ] Token stored securely (localStorage/sessionStorage)
- [ ] User redirected to dashboard after login

### Registration
- [ ] Form validates all required fields:
  - Name (required, min 2 chars)
  - Gender (required, one of: Male/Female/Other)
  - Date of birth (required, valid date, not future)
  - Weight (required, > 0, < 500)
  - Height (required, > 0, < 300)
- [ ] BMI auto-calculated on weight/height change
- [ ] HN generated automatically (format: HN-YYYYMMDD-XXXX)
- [ ] HN is unique (no duplicates)
- [ ] Password validation:
  - Min 8 characters
  - At least 1 uppercase
  - At least 1 lowercase
  - At least 1 number
  - At least 1 special character
- [ ] Avatar upload optional (max 5MB, images only)
- [ ] Registration creates user profile
- [ ] PDPA consent recorded
- [ ] Welcome guide shown (first time only)
- [ ] User logged in after registration

### Profile Management
- [ ] Profile displays all user data
- [ ] HN shown prominently
- [ ] Avatar displays (or default)
- [ ] BMI calculated and displayed
- [ ] Profile update validates fields
- [ ] Profile update saves changes
- [ ] BMI recalculated on weight/height update
- [ ] Success message on update

---

## Feature 2: Records List + Case Detail with Slit Lamp Images

### Records List
- [ ] Only patient's own cases displayed
- [ ] Cases sorted by date (newest first)
- [ ] Each case card shows:
  - Thumbnail image
  - Date
  - Diagnosis
  - Status (Draft/Finalized)
  - AI analysis preview (first 100 chars)
- [ ] Loading state while fetching
- [ ] Empty state if no cases
- [ ] Error handling if API fails
- [ ] Clicking case navigates to detail

### Authorization
- [ ] Patient cannot see other patients' cases (403)
- [ ] Patient cannot access other patient's case detail (403)
- [ ] Doctor can see all cases
- [ ] Admin can see all cases

### Case Detail
- [ ] Header displays: HN, Date, Share button
- [ ] Slit lamp image displays (full size)
- [ ] Image zoomable on click
- [ ] Image responsive (mobile/desktop)
- [ ] Diagnosis summary displayed
- [ ] Doctor's notes displayed
- [ ] AI analysis text displayed (full)
- [ ] Structural findings checklist displayed:
  - Lids/Lashes
  - Conjunctiva
  - Cornea
  - Anterior Chamber
  - Iris
  - Lens
- [ ] Each checklist item shows: Observed/Not Observed, Verified status
- [ ] Left eye data displayed (if available)
- [ ] Right eye data displayed (if available)
- [ ] Back button returns to list
- [ ] Share button works (copy link)

### Image Display
- [ ] Image loads from correct URL
- [ ] Image loading state shown
- [ ] Image fallback if not found
- [ ] Image zoom works (click to zoom)
- [ ] Image pan works (when zoomed)
- [ ] Image responsive on mobile

---

## Feature 3: Medication Tracker + Logs

### Medication List
- [ ] All active medications displayed
- [ ] Each medication shows:
  - Medicine name
  - Type (drop/pill/other) with icon
  - Frequency (e.g., "4 times/day")
  - Next dose time
  - Taken status (checkbox)
- [ ] Medications sorted by next dose time
- [ ] Upcoming medications highlighted
- [ ] Past due medications shown with warning
- [ ] Only patient's own medications shown

### Add Medication
- [ ] "Add Medication" button opens modal/form
- [ ] Form fields:
  - Medicine name (required)
  - Type: drop/pill/other (required)
  - Frequency: dropdown (required)
  - Next time: time picker (required)
  - Dosage: optional text
  - Start date: date picker (default: today)
  - End date: optional date picker
- [ ] Frequency options:
  - Once daily
  - Twice daily
  - 3 times/day
  - 4 times/day
  - Every 6 hours
  - Custom
- [ ] Form validates all required fields
- [ ] Medication created on submit
- [ ] Success message shown
- [ ] List refreshes
- [ ] Modal closes

### Medication Logging
- [ ] "Taken" checkbox creates log entry
- [ ] Log entry includes:
  - Medication ID
  - Scheduled time (calculated)
  - Taken at: current timestamp
  - Taken: true
- [ ] Next dose time recalculated
- [ ] Success feedback shown
- [ ] List updates
- [ ] Unchecking "Taken" updates log (taken: false)

### Medication History
- [ ] History displays all log entries
- [ ] Each log shows:
  - Date/time scheduled
  - Date/time taken (or "Missed")
  - Medication name
  - Status: Taken/Missed
- [ ] Logs sorted by date (newest first)
- [ ] Adherence rate calculated:
  - Per medication
  - Overall
- [ ] Adherence displayed as percentage
- [ ] Filter by medication (optional)
- [ ] Filter by date range (optional)

### Edit/Delete Medication
- [ ] Edit button opens form with current values
- [ ] Form updates medication
- [ ] Delete button soft deletes (is_active: false)
- [ ] Deleted medications hidden from list

---

## Feature 4: Articles + Reader

### Articles List
- [ ] All published articles displayed
- [ ] Articles shown as cards with:
  - Thumbnail image
  - Title
  - Category
  - Read time
  - Published date
  - Excerpt (first 150 chars)
- [ ] Articles sorted by published date (newest first)
- [ ] Category filter available (optional)
- [ ] Search by title (optional)
- [ ] Pagination (20 per page)
- [ ] Clicking article navigates to reader

### Article Reader
- [ ] Header image displays
- [ ] Title displays
- [ ] Category badge displays
- [ ] Published date displays
- [ ] Read time displays
- [ ] Full content displays (formatted)
- [ ] Content is readable (proper typography)
- [ ] Images in content display correctly
- [ ] Responsive layout (mobile/desktop)
- [ ] Back button returns to list
- [ ] Share button works (optional)
- [ ] View count increments on view

### Content Formatting
- [ ] HTML content rendered safely
- [ ] Markdown converted to HTML (if used)
- [ ] Images responsive
- [ ] Text readable (font size, line height)
- [ ] Proper spacing and paragraphs

---

## PDPA Compliance

### Terms & Conditions
- [ ] Terms displayed before registration
- [ ] User must accept terms to proceed
- [ ] Terms version tracked
- [ ] Consent recorded with:
  - User ID
  - Terms version
  - Acceptance timestamp
  - IP address
  - User agent
- [ ] Consent history maintained

### Privacy Policy
- [ ] Privacy policy displayed
- [ ] User must accept privacy policy
- [ ] Privacy policy versioned
- [ ] Consent recorded

### Data Access
- [ ] Patients can only access their own data
- [ ] All patient queries filtered by user ID
- [ ] Authorization middleware enforces access
- [ ] 403 error for unauthorized access

---

## Technical Requirements

### Performance
- [ ] API response time < 200ms (p95)
- [ ] Page load time < 2s
- [ ] Images optimized (compressed, WebP)
- [ ] Lazy loading for images
- [ ] Code splitting implemented

### Security
- [ ] JWT tokens secure
- [ ] Password hashed (bcrypt)
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Sequelize)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Rate limiting active

### Error Handling
- [ ] All API errors handled gracefully
- [ ] User-friendly error messages
- [ ] Error logging (Winston)
- [ ] 404 pages
- [ ] 500 error pages
- [ ] Network error handling

### Responsive Design
- [ ] Mobile layout works (< 768px)
- [ ] Tablet layout works (768px - 1024px)
- [ ] Desktop layout works (> 1024px)
- [ ] Touch-friendly buttons
- [ ] Readable text on all screen sizes

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Alt text for images
- [ ] Proper heading hierarchy
- [ ] Color contrast meets WCAG AA

---

## Testing Checklist

### Manual Testing
- [ ] Test OTP login flow
- [ ] Test registration flow
- [ ] Test profile update
- [ ] Test records list
- [ ] Test case detail
- [ ] Test medication CRUD
- [ ] Test medication logging
- [ ] Test articles list
- [ ] Test article reader
- [ ] Test authorization (patient sees own only)
- [ ] Test error states
- [ ] Test loading states
- [ ] Test empty states

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Device Testing
- [ ] iPhone (various sizes)
- [ ] Android phone (various sizes)
- [ ] iPad
- [ ] Desktop (various resolutions)

---

**Last Updated**: December 2024

