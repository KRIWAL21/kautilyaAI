<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useSocialStore } from "@/stores/socialStore";
import { useAuthStore } from "@/stores/authStore";
import ImageUploader from "@/components/ImageUploader.vue";

const router = useRouter();

const socialStore = useSocialStore();
const {
  posts,
  total,
  loading,
  error,
  commentsByPost,
  commentsLoadingByPost,
  connectRequestsByPost,
} = storeToRefs(socialStore);

const authStore = useAuthStore();

// Customer is the audience for this app — all posts go in as authorType=customer.
const AUTHOR_TYPE = "customer";

const me = computed(() => ({
  id: authStore.user?._id || localStorage.getItem("customerId") || "",
  name:
    authStore.currentUserData?.name ||
    authStore.user?.name ||
    "Guest",
  avatar: authStore.user?.userImage || "",
  type: AUTHOR_TYPE,
}));

const isLoggedIn = computed(() => authStore.isAuthenticated && !!me.value.id);

// Composer
const newPost = ref("");
const newPostImages = ref([]); // uploaded S3 URLs
const posting = ref(false);
const composerError = ref("");

const submitPost = async () => {
  composerError.value = "";
  if (!isLoggedIn.value) {
    composerError.value = "Please log in to post.";
    return;
  }
  if (!newPost.value.trim()) {
    composerError.value = "Write something to post.";
    return;
  }

  posting.value = true;
  try {
    await socialStore.createPost({
      content: newPost.value.trim(),
      images: newPostImages.value || [],
      authorId: me.value.id,
      authorType: me.value.type,
      authorName: me.value.name,
      authorAvatar: me.value.avatar,
    });
    newPost.value = "";
    newPostImages.value = [];
  } catch (err) {
    composerError.value =
      err?.response?.data?.message || err?.message || "Failed to post.";
  } finally {
    posting.value = false;
  }
};

// Per-post UI state
const expandedPostId = ref("");
const newCommentByPost = ref({});

const toggleExpand = async (postId) => {
  if (expandedPostId.value === postId) {
    expandedPostId.value = "";
    return;
  }
  expandedPostId.value = postId;
  if (!commentsByPost.value[postId]) {
    await socialStore.fetchComments(postId);
  }
};

const handleLike = async (post) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }
  try {
    await socialStore.toggleLike(post._id, {
      userId: me.value.id,
      userType: me.value.type,
    });
  } catch (err) {
    console.error("Like failed", err);
  }
};

const submitComment = async (post) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }
  const text = (newCommentByPost.value[post._id] || "").trim();
  if (!text) return;
  try {
    await socialStore.addComment(post._id, {
      content: text,
      authorId: me.value.id,
      authorType: me.value.type,
      authorName: me.value.name,
      authorAvatar: me.value.avatar,
    });
    newCommentByPost.value = { ...newCommentByPost.value, [post._id]: "" };
  } catch (err) {
    console.error("Comment failed", err);
  }
};

const handleDeletePost = async (post) => {
  if (!isLoggedIn.value) return;
  if (!confirm("Delete this post?")) return;
  try {
    await socialStore.deletePost(post._id, {
      requesterId: me.value.id,
      requesterType: me.value.type,
    });
  } catch (err) {
    alert(err?.response?.data?.message || "Could not delete post.");
  }
};

const handleDeleteComment = async (post, comment) => {
  if (!isLoggedIn.value) return;
  if (!confirm("Delete this comment?")) return;
  try {
    await socialStore.deleteComment(post._id, comment._id, {
      requesterId: me.value.id,
      requesterType: me.value.type,
    });
  } catch (err) {
    alert(err?.response?.data?.message || "Could not delete comment.");
  }
};

const isMyPost = (post) =>
  isLoggedIn.value &&
  String(post?.authorId) === String(me.value.id) &&
  post?.authorType === me.value.type;

const isMyComment = (comment) =>
  isLoggedIn.value &&
  String(comment?.authorId) === String(me.value.id) &&
  comment?.authorType === me.value.type;

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const roleColor = (type) => {
  switch (type) {
    case "broker":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "builder":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "admin":
    case "super-admin":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "sourcing-manager":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "customer":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const roleLabel = (type) => {
  if (!type) return "User";
  return type
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
};

const timeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString();
};

onMounted(async () => {
  // Marketplace customers only see their own posts in the community feed.
  // Their posts spread to brokers via the broker dashboard's social view.
  if (me.value.id) {
    await Promise.all([
      socialStore.fetchPosts({
        viewerId: me.value.id,
        viewerType: me.value.type,
        authorId: me.value.id,
        authorType: me.value.type,
      }),
      socialStore.fetchMyConnectRequests(me.value.id),
    ]);
  } else {
    await socialStore.fetchPosts({});
  }
});

// Helper used in template: respond to a connect request inline.
const respondingId = ref("");
const respondConnect = async (requestId, status) => {
  if (!me.value.id) {
    router.push("/login");
    return;
  }
  respondingId.value = requestId;
  try {
    await socialStore.respondConnectRequest(requestId, me.value.id, status);
  } catch (err) {
    console.error("Connect respond failed", err);
  } finally {
    respondingId.value = "";
  }
};

const requestsForPost = (postId) =>
  connectRequestsByPost.value?.[String(postId)] || [];

const pendingRequestCount = (postId) =>
  requestsForPost(postId).filter((r) => r.status === "pending").length;
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-12">
    <section class="max-w-3xl mx-auto pt-24 px-4">
      <div class="mb-6">
        <h1 class="text-3xl font-marcellus text-gray-900">Community</h1>
        <p class="text-sm text-gray-500 mt-1">
          What's happening in the marketplace right now.
        </p>
      </div>

      <!-- Composer -->
      <div class="bg-white rounded-2xl border shadow-sm p-4 mb-6">
        <div class="flex gap-3">
          <div class="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
            <img
              v-if="me.avatar"
              :src="me.avatar"
              :alt="me.name"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ initials(me.name) }}</span>
          </div>
          <div class="flex-1">
            <textarea
              v-model="newPost"
              rows="3"
              placeholder="Share an update, a question, or a listing…"
              class="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-orange-400 resize-none"
            ></textarea>
            <!-- <div class="mt-2">
              <ImageUploader
                v-model="newPostImages"
                folder="social"
                :max="4"
              />
            </div> -->
            <p v-if="composerError" class="text-red-500 text-xs mt-2">
              {{ composerError }}
            </p>
            <div class="mt-3 flex items-center justify-between">
              <p v-if="!isLoggedIn" class="text-xs text-gray-500">
                <router-link to="/login" class="text-orange-600 underline">Log in</router-link>
                to post.
              </p>
              <p v-else class="text-xs text-gray-400">
                Posting as <span class="font-medium">{{ me.name }}</span>
              </p>
              <button
                @click="submitPost"
                :disabled="posting || !newPost.trim()"
                class="bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium px-5 py-1.5 rounded-full shadow disabled:opacity-50"
              >
                {{ posting ? "Posting…" : "Post" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feed -->
      <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">
        {{ error }}
      </div>

      <div v-if="loading && !posts.length" class="space-y-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-2xl border p-4 animate-pulse"
        >
          <div class="flex gap-3">
            <div class="h-10 w-10 rounded-full bg-gray-100"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-100 rounded w-1/3"></div>
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!posts.length"
        class="text-center py-16 text-gray-500 bg-white rounded-2xl border"
      >
        <i class="pi pi-comments text-5xl text-gray-300 mb-3 block"></i>
        <p>No posts yet — be the first to share something.</p>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="post in posts"
          :key="post._id"
          class="bg-white rounded-2xl border shadow-sm p-4"
        >
          <header class="flex items-start gap-3">
            <div class="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
              <img
                v-if="post.authorAvatar"
                :src="post.authorAvatar"
                :alt="post.authorName"
                class="h-full w-full rounded-full object-cover"
              />
              <span v-else>{{ initials(post.authorName) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-sm text-gray-900 truncate">
                  {{ post.authorName || "Anonymous" }}
                </p>
                <span
                  class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  :class="roleColor(post.authorType)"
                >
                  {{ roleLabel(post.authorType) }}
                </span>
                <span class="text-xs text-gray-400">
                  · {{ timeAgo(post.createdAt) }}
                </span>
              </div>
            </div>
            <button
              v-if="isMyPost(post)"
              @click="handleDeletePost(post)"
              class="text-gray-400 hover:text-red-500"
              aria-label="Delete post"
            >
              <i class="pi pi-trash text-sm"></i>
            </button>
          </header>

          <div class="mt-3 text-sm text-gray-800 whitespace-pre-line">
            {{ post.content }}
          </div>

          <div
            v-if="post.images?.length"
            class="mt-3 grid gap-2"
            :class="post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
          >
            <img
              v-for="(src, i) in post.images.slice(0, 4)"
              :key="i"
              :src="src"
              class="rounded-xl w-full max-h-72 object-cover border"
            />
          </div>

          <footer class="mt-4 flex items-center gap-6 text-xs text-gray-500 flex-wrap">
            <button
              @click="handleLike(post)"
              class="flex items-center gap-1.5 hover:text-red-500 transition"
              :class="post.likedByMe ? 'text-red-500' : ''"
            >
              <i :class="['pi', post.likedByMe ? 'pi-heart-fill' : 'pi-heart', 'text-sm']"></i>
              {{ post.likeCount || 0 }} like{{ post.likeCount === 1 ? "" : "s" }}
            </button>
            <button
              @click="toggleExpand(post._id)"
              class="flex items-center gap-1.5 hover:text-orange-500"
            >
              <i class="pi pi-comment text-sm"></i>
              {{ post.commentsCount || 0 }} comment{{ post.commentsCount === 1 ? "" : "s" }}
            </button>
            <span
              v-if="requestsForPost(post._id).length"
              class="flex items-center gap-1.5 text-orange-600"
            >
              <i class="pi pi-user-plus text-sm"></i>
              {{ requestsForPost(post._id).length }} broker request{{ requestsForPost(post._id).length === 1 ? "" : "s" }}
              <span
                v-if="pendingRequestCount(post._id) > 0"
                class="ml-1 inline-block bg-orange-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5"
              >
                {{ pendingRequestCount(post._id) }} pending
              </span>
            </span>
          </footer>

          <!-- Connect requests on this post (visible only to the post author) -->
          <div
            v-if="requestsForPost(post._id).length"
            class="mt-4 pt-4 border-t border-gray-100"
          >
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Brokers who want to help
            </p>
            <ul class="space-y-2">
              <li
                v-for="req in requestsForPost(post._id)"
                :key="req._id"
                class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border"
              >
                <div class="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <img
                    v-if="req.brokerAvatar"
                    :src="req.brokerAvatar"
                    :alt="req.brokerName"
                    class="h-full w-full rounded-full object-cover"
                  />
                  <span v-else>{{ initials(req.brokerName) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {{ req.brokerName || "Broker" }}
                    </p>
                    <span
                      class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                      :class="
                        req.status === 'approved'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : req.status === 'rejected'
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                      "
                    >
                      {{ req.status }}
                    </span>
                  </div>
                  <p
                    v-if="req.message"
                    class="text-xs text-gray-700 mt-1 whitespace-pre-line"
                  >
                    {{ req.message }}
                  </p>
                  <div
                    v-if="req.status === 'approved' && (req.brokerPhone || req.brokerEmail)"
                    class="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-1"
                  >
                    <span v-if="req.brokerPhone">📞 {{ req.brokerPhone }}</span>
                    <span v-if="req.brokerEmail">✉️ {{ req.brokerEmail }}</span>
                  </div>

                  <div
                    v-if="req.status === 'pending'"
                    class="flex items-center gap-2 mt-2"
                  >
                    <button
                      :disabled="respondingId === req._id"
                      @click="respondConnect(req._id, 'approved')"
                      class="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      :disabled="respondingId === req._id"
                      @click="respondConnect(req._id, 'rejected')"
                      class="text-xs font-semibold px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Comments -->
          <div
            v-if="expandedPostId === post._id"
            class="mt-4 pt-4 border-t border-gray-100 space-y-3"
          >
            <div v-if="commentsLoadingByPost[post._id]" class="text-xs text-gray-400">
              Loading comments…
            </div>

            <div
              v-for="comment in commentsByPost[post._id] || []"
              :key="comment._id"
              class="flex gap-2"
            >
              <div class="h-7 w-7 rounded-full bg-gray-300 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                <img
                  v-if="comment.authorAvatar"
                  :src="comment.authorAvatar"
                  :alt="comment.authorName"
                  class="h-full w-full rounded-full object-cover"
                />
                <span v-else>{{ initials(comment.authorName) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="bg-gray-50 rounded-xl px-3 py-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-xs font-semibold text-gray-900 truncate">
                      {{ comment.authorName || "User" }}
                    </p>
                    <span
                      class="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                      :class="roleColor(comment.authorType)"
                    >
                      {{ roleLabel(comment.authorType) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-700 mt-1 whitespace-pre-line">
                    {{ comment.content }}
                  </p>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-gray-400 mt-1 pl-1">
                  <span>{{ timeAgo(comment.createdAt) }}</span>
                  <button
                    v-if="isMyComment(comment)"
                    @click="handleDeleteComment(post, comment)"
                    class="hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="!commentsLoadingByPost[post._id] && !(commentsByPost[post._id] || []).length"
              class="text-xs text-gray-400"
            >
              No comments yet.
            </div>

            <!-- Comment composer -->
            <div class="flex gap-2 pt-2">
              <input
                :value="newCommentByPost[post._id] || ''"
                @input="newCommentByPost[post._id] = $event.target.value"
                @keyup.enter="submitComment(post)"
                type="text"
                placeholder="Write a comment…"
                class="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 outline-none focus:border-orange-400"
              />
              <button
                @click="submitComment(post)"
                :disabled="!(newCommentByPost[post._id] || '').trim()"
                class="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </div>
        </article>
      </div>

      <p v-if="posts.length" class="text-xs text-gray-400 text-center mt-6">
        Showing {{ posts.length }} of {{ total }} posts
      </p>
    </section>
  </main>
</template>
