import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("ENV URL:", supabaseUrl);
console.log("ENV KEY EXISTS:", !!supabasePublishableKey);

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
        `Missing Supabase config. URL loaded: ${!!supabaseUrl}, Key loaded: ${!!supabasePublishableKey}`
    );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});