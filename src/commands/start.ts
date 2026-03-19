import { User } from '../models/User.js';
import { MyContext } from '../types.js';
import { getStartKeyboard } from '../keyboards/allKeyboards.js';

export const start = async (ctx: MyContext) => {
    if (!ctx.from) {
        await ctx.reply('❌ Ошибка: не могу определить пользователя.');
        return;
    }
    const { id, first_name, username } = ctx.from;

    try {
        const user = await User.findOne({ telegramid: id });
        if (user) {
            await ctx.reply('👋 Снова здесь! Соскучились по ароматам?', {
                reply_markup: getStartKeyboard(),
            });
            return;
        }

        const newUser = new User({
            telegramid: id,
            firstName: first_name,
            userName: username,
        });
        await newUser.save();
        await ctx.reply('👋 Ты с нами! Новинки и скидки — сразу сюда!', {
            reply_markup: getStartKeyboard(),
        });
    } catch (error) {
        console.error('❌ Registration error', error);
        await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
    }
};
