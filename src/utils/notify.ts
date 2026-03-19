import { Bot } from 'grammy';
import { MyContext } from '../types.js';
import { User } from '../models/User.js';
import { InlineKeyboard } from 'grammy';

export async function notifyNewProduct(
    bot: Bot<MyContext>,
    product: {
        name: string;
        price: number;
        wbUrl: string;
    },
) {
    const subscribers = await User.find({ notifyNew: true });

    const keyboard = new InlineKeyboard()
        .url('👀 Смотреть на WB', product.wbUrl)
        .row()
        .text('🔔 В меню', 'start');

    for (const user of subscribers) {
        try {
            await bot.api.sendMessage(
                user.telegramid,
                `🆕 НОВИНКА!\n\n${product.name}\n💰 ${product.price}₽`,
                { reply_markup: keyboard },
            );
            console.log(`✅ Notification send ${user.telegramid}`);
        } catch (error) {
            const e = error as Error;

            console.log(`❌ Error in ${user.telegramid}:`, e.message);
            if (e.message.includes('blocked')) {
                user.notifyNew = false;
                user.notifyDiscount = false;
                await user.save();
            }
        }
    }
}

export async function notifyDiscount(
    bot: Bot<MyContext>,
    product: {
        name: string;
        oldPrice: number;
        newPrice: number;
        wbUrl: string;
    },
) {
    const subscribers = await User.find({ notifyDiscount: true });
    const discount = Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100);

    const keyboard = new InlineKeyboard()
        .url('👀 Смотреть на WB', product.wbUrl)
        .row()
        .text('🔔 В меню', 'start');

    for (const user of subscribers) {
        try {
            await bot.api.sendMessage(
                user.telegramid,
                `💰 СКИДКА!\n\n${product.name}\n💸 Было: ${product.oldPrice}₽\n🔥 Стало: ${product.newPrice}₽ (-${discount}%)`,
                { reply_markup: keyboard },
            );
            console.log(`✅ Notification send ${user.telegramid}`);
        } catch (error) {
            const e = error as Error;
            console.log(`❌ Error in ${user.telegramid}:`, e.message);
            if (e.message.includes('blocked')) {
                user.notifyNew = false;
                user.notifyDiscount = false;
                await user.save();
            }
        }
    }
}
