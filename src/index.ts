import 'dotenv/config';
import { Bot } from 'grammy';
import { GrammyError, HttpError } from 'grammy';
import mongoose from 'mongoose';
import { start } from './commands/index.js';
import { hydrate } from '@grammyjs/hydrate';
import { MyContext } from './types.js';
import { getStartKeyboard, getNotifyKeyboard } from './keyboards/allKeyboards.js';
import { User } from './models/User.js';
import { editMessage, notifyNewProduct, notifyDiscount } from './utils/index.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('❌ BOT_API_KEY is not defined');
}
const bot = new Bot<MyContext>(BOT_TOKEN);
bot.use(hydrate());

bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Запуск бота',
    },
]);

bot.command('start', start);

const ADMIN_ID = Number(process.env.ADMIN_ID);

bot.command('testnotify', async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
        return;
    }

    await notifyNewProduct(bot, {
        name: 'Набор отливантов "Гурманский-3" Lattafa, 6 шт по 2мл.',
        price: 1169,
        wbUrl: 'https://www.wildberries.ru/catalog/761617634/detail.aspx',
    });

    await notifyDiscount(bot, {
        name: 'Molten Caramel отливант 5 мл.',
        oldPrice: 550,
        newPrice: 270,
        wbUrl: 'https://www.wildberries.ru/catalog/500480579/detail.aspx',
    });
});

bot.callbackQuery('notify', async (ctx) => {
    if (!ctx.from) {
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка: не могу определить пользователя.',
            show_alert: true,
        });
        return;
    }
    try {
        const user = await User.findOne({ telegramid: ctx.from.id });

        if (!user) {
            await ctx.answerCallbackQuery({
                text: '❌ Пользователь не найден. Нажмите /start',
                show_alert: true,
            });
            return;
        }

        await editMessage(ctx, '🔔 Настройка уведомлений', getNotifyKeyboard(user));
    } catch (error) {
        console.error('❌ MONGODB error in notify:', error);
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка базы данных. Попробуйте позже.',
            show_alert: true,
        });
    }
});

bot.callbackQuery('toggleNew', async (ctx) => {
    if (!ctx.from) {
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка: не могу определить пользователя.',
            show_alert: true,
        });
        return;
    }

    try {
        const user = await User.findOne({ telegramid: ctx.from.id });

        if (!user) {
            await ctx.answerCallbackQuery({
                text: '❌ Ошибка: пользователь не найден. Нажмите /start',
                show_alert: true,
            });
            return;
        }

        user.notifyNew = !user.notifyNew;
        await user.save();

        const keyboard = getNotifyKeyboard(user);

        await ctx.editMessageReplyMarkup({
            reply_markup: keyboard,
        });

        await ctx.answerCallbackQuery({
            text: user.notifyNew
                ? '✅ Уведомления о новинках включены.'
                : '❌ Уведомления о новинках отключены.',
            show_alert: true,
        });
    } catch (error) {
        console.error('❌ MongoDB error in toggleNew:', error);
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка базы данных. Попробуйте позже.',
            show_alert: true,
        });
    }
});

bot.callbackQuery('toggleDiscount', async (ctx) => {
    if (!ctx.from) {
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка: не могу определить пользователя.',
            show_alert: true,
        });
        return;
    }

    try {
        const user = await User.findOne({ telegramid: ctx.from.id });

        if (!user) {
            await ctx.answerCallbackQuery({
                text: '❌ Ошибка: пользователь не найден. Нажмите /start',
                show_alert: true,
            });
            return;
        }

        user.notifyDiscount = !user.notifyDiscount;
        await user.save();

        const keyboard = getNotifyKeyboard(user);

        await ctx.editMessageReplyMarkup({
            reply_markup: keyboard,
        });

        await ctx.answerCallbackQuery({
            text: user.notifyDiscount
                ? '✅ Уведомления о скидках включены.'
                : '❌ Уведомления о скидках отключены.',
            show_alert: true,
        });
    } catch (error) {
        console.error('❌ MongoDB error in toggleDiscount:', error);
        await ctx.answerCallbackQuery({
            text: '❌ Ошибка базы данных. Попробуйте позже.',
            show_alert: true,
        });
    }
});

bot.callbackQuery('backToStart', async (ctx) => {
    try {
        await editMessage(ctx, '👋 Снова здесь! Соскучились по ароматам?', getStartKeyboard());
    } catch (error) {
        console.error('❌ Error in backToStart:', error);
        await ctx.reply('❌ Не удалось обновить меню. Попробуйте позже.');
    }
});

bot.callbackQuery('start', async (ctx) => {
    await ctx.answerCallbackQuery();

    try {
        await ctx.reply('👋 Снова здесь! Соскучились по ароматам?', {
            reply_markup: getStartKeyboard(),
        });
    } catch (error) {
        console.error('❌ Error in start callback:', error);
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`❌ Error while handling update ${ctx.update.update_id}`);
    const e = err.error;

    if (e instanceof GrammyError) {
        console.error('❌ Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('❌ Could not contact Telegram:', e);
    } else {
        console.error('❌ Unknown error:', e);
    }
});

async function startBot() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('❌ MONGODB_URI is not defined');
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');

        const shutdown = async () => {
            console.log('\nShutting down...');
            await bot.stop();
            await mongoose.disconnect();
            console.log('Bot stopped');
            process.exit(0);
        };

        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);

        bot.start();
        console.log('✅ Bot started');
    } catch (error) {
        console.error('❌ Error in startBot:', error);
        process.exit(1);
    }
}

startBot();
