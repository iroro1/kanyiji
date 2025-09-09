# Quick Appwrite Setup for Kanyiji

## 1. Database Setup

### Create Database

1. Go to [https://fra.cloud.appwrite.io](https://fra.cloud.appwrite.io)
2. Select project: **Kanyiji** (ID: 68ac471200239fa89670)
3. Go to **Databases** → **Create Database**
4. **Name**: `kanyiji_main`
5. **Database ID**: `kanyiji_main`
6. Click **Create**

### Create Users Collection

1. In your database, click **Create Collection**
2. **Name**: `users`
3. **Collection ID**: `users`
4. Click **Create**

#### Add Users Collection Attributes:

1. Go to **Attributes** tab
2. Add each attribute with these settings:

| Attribute Name   | Type    | Required | Array | Default | Enum Values                   |
| ---------------- | ------- | -------- | ----- | ------- | ----------------------------- |
| `user_id`        | String  | ✅       | ❌    | -       | -                             |
| `email`          | String  | ✅       | ❌    | -       | -                             |
| `full_name`      | String  | ✅       | ❌    | -       | -                             |
| `role`           | String  | ✅       | ❌    | -       | `customer`, `vendor`, `admin` |
| `phone`          | String  | ❌       | ❌    | -       | -                             |
| `email_verified` | Boolean | ✅       | ❌    | `false` | -                             |
| `created_at`     | String  | ✅       | ❌    | -       | -                             |
| `updated_at`     | String  | ✅       | ❌    | -       | -                             |

### Set Collection Permissions

1. Go to **Settings** tab
2. **Create**: `users` (anyone can create)
3. **Read**: `users` (anyone can read)
4. **Update**: `users` (anyone can update)
5. **Delete**: `users` (anyone can delete)

## 2. Get Your IDs

After creating the database and collection, copy these IDs:

1. **Database ID**: Found in the database overview
2. **Users Collection ID**: Found in the collection overview

## 3. Update Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
```

## 4. Test the Setup

1. Restart your development server: `npm run dev`
2. Try to sign up - it should work now!

## Optional Collections (Create Later)

### Products Collection

- For storing product listings
- Attributes: name, price, description, vendor_id, images, etc.

### Orders Collection

- For storing customer orders
- Attributes: customer_id, products, total, status, shipping_info, etc.

### Storage Bucket

- For storing files (images, documents)
- Name: `kanyiji_files`
