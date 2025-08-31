import authApi from "@/src/apis/auth";
import { globalMessage } from "@components/Lib/GlobalMessage";
import { hookstate } from "@hookstate/core";
import { isWeb } from "@utils/deviceInfo";

type TypeStore = {
    isConnected: boolean;
}

const initialStore: TypeStore = {
    isConnected: false
}

export const loginStore = hookstate(initialStore);

export const checkHealth = async () => {
    if (!isWeb) {
        try {
            const data = await authApi.checkHealth();
            console.log("data.data", data.data);
            loginStore.isConnected.set(true);
            return true;
        } catch (error: any) {
            if (error.code === "ERR_NETWORK") {
                globalMessage.show(
                    "Thông báo",
                    "Bạn cần phải sử dụng đúng mạng nội bộ yêu cầu."
                );
            }
            loginStore.isConnected.set(false);

            return false
        }
    } else { loginStore.isConnected.set(true); return true; }
}
