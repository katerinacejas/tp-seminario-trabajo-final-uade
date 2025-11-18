// Storage wrapper que funciona tanto en Web como en React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
	async getItem(key) {
		try {
			return await AsyncStorage.getItem(key);
		} catch (error) {
			console.error(`Error getting item ${key}:`, error);
			return null;
		}
	},

	async setItem(key, value) {
		try {
			await AsyncStorage.setItem(key, value);
		} catch (error) {
			console.error(`Error setting item ${key}:`, error);
		}
	},

	async removeItem(key) {
		try {
			await AsyncStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing item ${key}:`, error);
		}
	},

	async multiRemove(keys) {
		try {
			await AsyncStorage.multiRemove(keys);
		} catch (error) {
			console.error(`Error removing multiple items:`, error);
		}
	},
};
