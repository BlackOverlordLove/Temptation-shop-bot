import { InlineKeyboard } from 'grammy';
import { IUser } from '../models/User.js';

export const getStartKeyboard = () => {
    return new InlineKeyboard()
        .text('🆕 Новинки', 'newProducts')
        .text('💰 Скидки', 'discount')
        .row()
        .text('🔔 Настройка уведомлений', 'notify')
        .row()
        .url('📢 Наш канал', 'https://t.me/arabparfumTemptationShop');
};

export const getNotifyKeyboard = (user: IUser) => {
    return new InlineKeyboard()
        .text(user.notifyNew ? '✅ Новинки' : '❌ Новинки', 'toggleNew')
        .text(user.notifyDiscount ? '✅ Скидки' : '❌ Скидки', 'toggleDiscount')
        .row()
        .text('◀️ Назад', 'backToStart');
};
