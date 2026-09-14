import { defineStore } from "pinia";
import { news } from "@/data/news";

export const useNewsStore = defineStore("news", () => {

  // all news
  const newsList = news;

  // 🔥 filter by id
  const getNewsById = (id) => {
    return newsList.find((item) => item.id === id);
  };

  return {
    newsList,
    getNewsById,
  };
});