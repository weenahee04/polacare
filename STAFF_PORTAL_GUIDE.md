# Staff/Admin Portal Guide

## Quick Start

### 1. Seed Staff Accounts

```bash
cd backend
npm run seed:staff
```

This creates:
- Doctor: `0800000001` / `doctor123`
- Admin: `0800000002` / `admin123`

### 2. Start Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 3. Access Admin Portal

Navigate to: **http://localhost:3001/admin**

## URLs

| Portal | URL |
|--------|-----|
| Patient Portal | http://localhost:3001/ |
| Admin Portal | http://localhost:3001/admin |

## Features

### For Doctors (role: doctor)
- View all patient cases
- Create new cases
- Edit existing cases (Draft status)
- Finalize cases
- Upload slit lamp images
- Search patients by HN/phone
- View examination checklist

### For Admins (role: admin)
- All doctor features PLUS:
- Dashboard with statistics
- User management (CRUD)
- View audit logs
- System settings

## Case Management Workflow

1. **Create Case**
   - Click "New Case" button
   - Search and select patient by HN or phone
   - Fill in diagnosis and notes
   - Add eye examination data (OD/OS)
   - Review checklist items
   - Save as Draft

2. **Upload Images**
   - After saving case, click "Upload" in Images section
   - Drag & drop or browse for slit lamp images
   - Images are automatically optimized with thumbnails

3. **Finalize Case**
   - Review all information
   - Click "Finalize" to mark as complete
   - Finalized cases cannot be edited

## Audit Trail

All actions are logged:
- Case creation
- Case updates
- Status changes (Draft → Finalized)
- Image uploads/deletions

View audit logs in Admin Portal → Audit Logs

## API Endpoints

### Authentication
```
POST /api/v1/auth/login
Body: { phoneNumber, password }
```

### Cases
```
GET    /api/v1/admin/cases
POST   /api/v1/admin/cases
GET    /api/v1/admin/cases/:id
PUT    /api/v1/admin/cases/:id
POST   /api/v1/admin/cases/:id/finalize
GET    /api/v1/admin/cases/:id/audit
```

### Patient Search
```
GET /api/v1/admin/patients/search?q=HN-123
```

### Images
```
POST /api/v1/images/upload
GET  /api/v1/images/:id/proxy
```

## Security

- JWT authentication required
- Role-based access control
- Patients can only see their own data
- All changes are audited
- Images accessed via secure proxy

## Troubleshooting

### "Access denied"
- Make sure you're logged in as doctor or admin
- Patients cannot access the admin portal

### "Case not found"
- Check the case ID is correct
- Verify you have permission to view it

### Images not loading
- Check backend is running
- Verify storage configuration
- Check browser console for errors

---

**Need help?** Check `backend/ADMIN_PORTAL.md` for technical details.

