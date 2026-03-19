import { InlineKeyboard } from 'grammy';
import { MyContext } from '../types';

export const editMessage = async (ctx: MyContext, text: string, keyboard: InlineKeyboard) => {
    await ctx.answerCallbackQuery();
    await ctx.callbackQuery?.message?.editText(text, { reply_markup: keyboard });
};
