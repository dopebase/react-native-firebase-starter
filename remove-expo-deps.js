const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Expo packages that are NOT needed in bare workflow
const expoPackagesToRemove = [
  'expo',
  'expo-auth-session',
  'expo-blur',
  'expo-camera',
  'expo-checkbox',
  'expo-device',
  'expo-document-picker',
  'expo-facebook',
  'expo-file-system',
  'expo-image-manipulator',
  'expo-image-picker',
  'expo-localization',
  'expo-notifications',
  'expo-splash-screen',
  'expo-status-bar',
  'expo-tracking-transparency',
  'expo-video-thumbnails',
  'expo-web-browser',
  '@expo/html-elements',
  '@expo/react-native-action-sheet'
];

// Remove Expo packages that aren't needed in bare workflow
Object.keys(packageJson.dependencies).forEach(dep => {
  if (expoPackagesToRemove.includes(dep)) {
    console.log(`Removing: ${dep}`);
    delete packageJson.dependencies[dep];
  }
});

// Some packages might need to be replaced with native alternatives
packageJson.dependencies['@expo/react-native-action-sheet'] = '^4.0.0'; // Keep this one if needed

// Remove from devDependencies too if present
Object.keys(packageJson.devDependencies).forEach(dep => {
  if (expoPackagesToRemove.includes(dep)) {
    console.log(`Removing from devDependencies: ${dep}`);
    delete packageJson.devDependencies[dep];
  }
});

// Update the plugins array in app.json
if (packageJson.expo && packageJson.expo.plugins) {
  packageJson.expo.plugins = packageJson.expo.plugins.filter(plugin => 
    !expoPackagesToRemove.includes(typeof plugin === 'string' ? plugin : plugin[0])
  );
}

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Updated package.json - removed unnecessary Expo dependencies');