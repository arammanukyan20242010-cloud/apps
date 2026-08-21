declare module 'react-native';
declare module '@react-native-async-storage/async-storage';
declare module 'expo-haptics';
declare module 'react-native-confetti-cannon';

declare module 'react/jsx-runtime' {
	export function jsx(type: any, props?: any, key?: any): any;
	export function jsxs(type: any, props?: any, key?: any): any;
	export const Fragment: any;
}
