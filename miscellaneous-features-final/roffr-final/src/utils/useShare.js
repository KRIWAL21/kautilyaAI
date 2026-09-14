import { ref } from 'vue';

export function useShare() {
    const showShareModal = ref(false);
    const shareUrl = ref('');
    const shareTitle = ref('');

    const openShareModal = (url, title = 'Check out this property on Dealzo') => {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        shareUrl.value = fullUrl;
        shareTitle.value = title;
        showShareModal.value = true;
    };

    const closeShareModal = () => {
        showShareModal.value = false;
    };

    return {
        showShareModal,
        shareUrl,
        shareTitle,
        openShareModal,
        closeShareModal
    };
}
