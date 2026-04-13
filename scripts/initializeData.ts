import { courseService } from '../src/services/courseService';

async function initializeData() {
  try {
    console.log('Starting Firestore data initialization...');
    await courseService.initializeCourseData();
    console.log('Firestore data initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}

initializeData();
