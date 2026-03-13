import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (token) => {
 if(!token) throw new Error("missing token")
if(typeof token != "string") throw new Error("token must be string")
 await AsyncStorage.setItem("token", String(token).trim());
 return true
};

export const getToken = async()=>{
    const token = await AsyncStorage.getItem("token")
    if(!token) return null
    return token
}