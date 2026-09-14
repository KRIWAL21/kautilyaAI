import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore("modal", () => {
    const isLoginModalOpen = ref(false);
    const isBenefitsModalOpen = ref(false);

    const openLoginModal = () => {
        isLoginModalOpen.value = true;
    };

    const closeLoginModal = () => {
        isLoginModalOpen.value = false;
    };

    const openBenefitsModal = () => {
        isBenefitsModalOpen.value = true;
    };

    const closeBenefitsModal = () => {
        isBenefitsModalOpen.value = false;
    };

    return {
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isBenefitsModalOpen,
        openBenefitsModal,
        closeBenefitsModal,
    };
});
