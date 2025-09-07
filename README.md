# Edu-tech-dashboard

This project is a React + Vite based educational dashboard application. It provides features for managing students, subjects, syllabus progress tracking, tests, doubts, attendance, and task management.

## Features
- Student directory and management
- Subject management with chapters
- Syllabus progress tracking with chapter status and task auto-creation
- Test tracking with retest task creation on low scores
- Task management UI for manual and automated tasks
- Firebase Firestore backend for data persistence
- React Router for SPA navigation
- Tailwind CSS for styling

## Setup
- Requires Node.js and npm
- Firebase project setup with Firestore enabled
- Configure Firebase credentials in `src/firebase.js`
- Run `npm install` to install dependencies
- Run `npm run dev` to start the development server

## Notes
- Chapters in subjects have status flow: not_started -> started -> milestone -> finished
- Tasks are created automatically from syllabus progress and test results
- Manual task management available in Work Pool page

For more details, refer to the source code and comments.
