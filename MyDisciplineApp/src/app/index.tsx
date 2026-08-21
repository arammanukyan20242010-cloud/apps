import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

type ChallengeType = 'body' | 'mind' | 'spirit';

type MultilingualText = {
  ru: string;
  en: string;
};

type ChallengeItem = {
  id: string;
  type: ChallengeType;
  title: MultilingualText;
  description: MultilingualText;
  color: string;
  phase: number;
};

type LocalizedChallengeItem = Omit<ChallengeItem, 'title' | 'description'> & {
  title: string;
  description: string;
};

const TASKS_DATABASE: ChallengeItem[] = [
  { id: 'body-1', type: 'body', title: { ru: '10 минут движений', en: '10 minutes of movement' }, description: { ru: 'Плавно разомни плечи, спину и ноги.', en: 'Gently warm up your shoulders, back, and legs.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-2', type: 'body', title: { ru: 'Стретчинг на 8 минут', en: '8-minute stretching' }, description: { ru: 'Сделай растяжку таза, бедер и грудной клетки.', en: 'Stretch your hips, thighs and chest.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-3', type: 'body', title: { ru: 'Силовой мини-блок', en: 'Mini strength block' }, description: { ru: '3 подхода приседаний или отжиманий.', en: '3 sets of squats or push-ups.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-4', type: 'body', title: { ru: 'Дыхание и активность', en: 'Breathing and movement' }, description: { ru: 'Прогулка с глубоким дыханием 8–10 минут.', en: 'Walk with deep breathing for 8–10 minutes.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-5', type: 'body', title: { ru: 'Пульс выше 110', en: 'Pulse above 110' }, description: { ru: 'Небольшая кардио-серия для энергии.', en: 'A short cardio series to boost energy.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-6', type: 'body', title: { ru: 'Сила корпуса', en: 'Core strength' }, description: { ru: 'Планка 4 подхода по 30 секунд.', en: '4 sets of 30-second planks.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-7', type: 'body', title: { ru: 'Ясное тело', en: 'Clear body' }, description: { ru: 'Сосредоточься на осознанном движении каждой мышцы.', en: 'Focus on mindful motion in every muscle.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-8', type: 'body', title: { ru: 'Техника движения', en: 'Movement technique' }, description: { ru: 'Разбери 2 упражнения на качество выполнения.', en: 'Break down 2 exercises for quality.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-9', type: 'body', title: { ru: 'Режим восстановления', en: 'Recovery mode' }, description: { ru: 'Контрастные движения и расслабление.', en: 'Contrast movement and relaxation.' }, color: '#d46bff', phase: 3 },
  { id: 'body-10', type: 'body', title: { ru: 'Динамическая мощь', en: 'Dynamic power' }, description: { ru: 'Ускорь темп в контролируемой силовой серии.', en: 'Speed up tempo in a controlled strength series.' }, color: '#d46bff', phase: 3 },
  { id: 'body-11', type: 'body', title: { ru: 'Активная разминка', en: 'Active warmup' }, description: { ru: 'Динамичные движения и прыжки для пробуждения.', en: 'Dynamic movements and jumps to wake up.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-12', type: 'body', title: { ru: 'Гибкость и мобильность', en: 'Flexibility and mobility' }, description: { ru: 'Мягкие скручивания и боковые наклоны.', en: 'Gentle twists and side bends.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-13', type: 'body', title: { ru: 'Медленная сила', en: 'Slow strength' }, description: { ru: 'Удерживай позицию 20 секунд в каждом упражнении.', en: 'Hold position for 20 seconds in each exercise.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-14', type: 'body', title: { ru: 'Балансировка и центр', en: 'Balance and center' }, description: { ru: 'Упражнения на равновесие и укрепление корпуса.', en: 'Balance exercises and core strengthening.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-15', type: 'body', title: { ru: 'Волновая активность', en: 'Wave activity' }, description: { ru: 'Волнообразные движения для текучести тела.', en: 'Wave-like movements for body fluidity.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-16', type: 'body', title: { ru: 'Правильная осанка', en: 'Correct posture' }, description: { ru: 'Фокус на выпрямлении позвоночника и раскрытии груди.', en: 'Focus on spine alignment and chest opening.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-17', type: 'body', title: { ru: 'Усиленная выносливость', en: 'Enhanced endurance' }, description: { ru: '10 минут низкоударных упражнений в ритме.', en: '10 minutes of low-impact rhythmic exercises.' }, color: '#d46bff', phase: 3 },
  { id: 'body-18', type: 'body', title: { ru: 'Интеграция движений', en: 'Integration of movements' }, description: { ru: 'Объединение ранее изученных упражнений в одну последовательность.', en: 'Combine previously learned exercises into one sequence.' }, color: '#d46bff', phase: 3 },
  { id: 'body-19', type: 'body', title: { ru: 'Тонизирующая йога', en: 'Toning yoga' }, description: { ru: 'Йога-поток с упором на мышечное напряжение.', en: 'Yoga flow with focus on muscle tension.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-20', type: 'body', title: { ru: 'Контролируемое дыхание при движении', en: 'Controlled breathing during movement' }, description: { ru: 'Связь дыхания с каждым движением тела.', en: 'Link breathing with each body movement.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-21', type: 'body', title: { ru: 'Боевая готовность', en: 'Battle readiness' }, description: { ru: 'Быстрые движения и смена позиций.', en: 'Quick movements and position changes.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-22', type: 'body', title: { ru: 'Синхронизация с природой', en: 'Synchronization with nature' }, description: { ru: 'Движения, имитирующие естественные цикличные ритмы.', en: 'Movements mimicking natural rhythmic cycles.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-23', type: 'body', title: { ru: 'Освобождение напряжения', en: 'Release tension' }, description: { ru: 'Вибрирующие движения для снятия застоя.', en: 'Vibrating movements to release stagnation.' }, color: '#d46bff', phase: 3 },
  { id: 'body-24', type: 'body', title: { ru: 'Спортивная активность', en: 'Athletic activity' }, description: { ru: 'Любой вид спорта или прогулка на свежем воздухе.', en: 'Any sport or fresh air walk.' }, color: '#d46bff', phase: 3 },
  { id: 'body-25', type: 'body', title: { ru: 'Легкая зарядка', en: 'Light workout' }, description: { ru: '5-минутная мягкая разминка всех суставов.', en: '5-minute gentle warm-up of all joints.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-26', type: 'body', title: { ru: 'Циклическая активность', en: 'Cyclical activity' }, description: { ru: 'Повторяющиеся движения в медленном темпе.', en: 'Repetitive movements at slow pace.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-27', type: 'body', title: { ru: 'Максимальная мобильность', en: 'Maximum mobility' }, description: { ru: 'Полный диапазон движений для каждого сустава.', en: 'Full range of motion for each joint.' }, color: '#ff6f00', phase: 2 },
  { id: 'body-28', type: 'body', title: { ru: 'Потоковое движение', en: 'Flow movement' }, description: { ru: 'Плавное переходит от одного упражнения к другому.', en: 'Smooth transition from one exercise to another.' }, color: '#d46bff', phase: 3 },
  { id: 'body-29', type: 'body', title: { ru: 'Укрепление корней', en: 'Root strengthening' }, description: { ru: 'Упражнения стоя для укрепления ног и основания.', en: 'Standing exercises to strengthen legs and foundation.' }, color: '#ff9a3d', phase: 1 },
  { id: 'body-30', type: 'body', title: { ru: 'Полная интеграция', en: 'Full integration' }, description: { ru: 'Синтез всех видов движений в гармоничную практику.', en: 'Synthesis of all types of movement into harmonious practice.' }, color: '#d46bff', phase: 3 },
  { id: 'mind-1', type: 'mind', title: { ru: 'Тихая фокус-минута', en: 'Quiet focus minute' }, description: { ru: 'Слушай дыхание и отпускай лишние мысли.', en: 'Listen to your breath and let go of extra thoughts.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-2', type: 'mind', title: { ru: 'Запиши одну мысль', en: 'Write one thought' }, description: { ru: 'Отдели факт от эмоцию и запиши это.', en: 'Separate fact from feeling and note it down.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-3', type: 'mind', title: { ru: 'Найди факт доказательства', en: 'Find fact evidence' }, description: { ru: 'Проверь, что точно произошло сегодня.', en: 'Check what really happened today.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-4', type: 'mind', title: { ru: 'Пауза от экрана', en: 'Screen pause' }, description: { ru: '5 минут без телефона и без уведомлений.', en: '5 minutes without phone and notifications.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-5', type: 'mind', title: { ru: 'Переключение внимания', en: 'Attention switch' }, description: { ru: 'Сфокусируйся на простом объекте 3 минуты.', en: 'Focus on a simple object for 3 minutes.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-6', type: 'mind', title: { ru: 'Анализ настроения', en: 'Mood analysis' }, description: { ru: 'Определи, что сегодня давит сильнее всего.', en: 'Identify what weighs on you most today.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-7', type: 'mind', title: { ru: 'План без давления', en: 'Pressure-free plan' }, description: { ru: 'Напиши 1 задачу, которую легко выполнить.', en: 'Write one task that feels easy to complete.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-8', type: 'mind', title: { ru: 'Рефлексия быстрого дня', en: 'Quick day reflection' }, description: { ru: 'Что пошло хорошо и что можно отпустить.', en: 'What went well and what can be released.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-9', type: 'mind', title: { ru: 'Ментальная ясность', en: 'Mental clarity' }, description: { ru: 'Почувствуй, где тело напряжено, и отпусти.', en: 'Feel where your body is tense and release it.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-10', type: 'mind', title: { ru: 'Новая техника внимания', en: 'New attention technique' }, description: { ru: 'Сменяй фокус каждые 60 секунд.', en: 'Change focus every 60 seconds.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-11', type: 'mind', title: { ru: 'Замечание образов', en: 'Noticing images' }, description: { ru: 'Наблюдай за образами в сознании без суждений.', en: 'Observe mental images without judgment.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-12', type: 'mind', title: { ru: 'Отпускание контроля', en: 'Letting go of control' }, description: { ru: 'Практика вотпускания нужды контролировать.', en: 'Practice releasing the need to control.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-13', type: 'mind', title: { ru: 'Интеграция опыта', en: 'Integration of experience' }, description: { ru: 'Осознай один позитивный момент сегодня.', en: 'Recognize one positive moment from today.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-14', type: 'mind', title: { ru: 'Пестрое восприятие', en: 'Varied perception' }, description: { ru: 'Смотри на проблему с разных углов.', en: 'Look at problem from different angles.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-15', type: 'mind', title: { ru: 'Выявление паттернов', en: 'Pattern recognition' }, description: { ru: 'Найди повторяющийся паттерн в своих мыслях.', en: 'Find repeating pattern in your thoughts.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-16', type: 'mind', title: { ru: 'Логическое разрешение', en: 'Logical resolution' }, description: { ru: 'Разложи сложную задачу на простые части.', en: 'Break complex task into simple parts.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-17', type: 'mind', title: { ru: 'Глубокое слушание', en: 'Deep listening' }, description: { ru: 'Слушай свой внутренний голос без прерываний.', en: 'Listen to inner voice without interruption.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-18', type: 'mind', title: { ru: 'Синтез идей', en: 'Synthesis of ideas' }, description: { ru: 'Объедини две разные идеи в новую концепцию.', en: 'Combine two different ideas into new concept.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-19', type: 'mind', title: { ru: 'Визуализация успеха', en: 'Visualization of success' }, description: { ru: 'Визуализируй успешное завершение задачи.', en: 'Visualize successful task completion.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-20', type: 'mind', title: { ru: 'Связь с целью', en: 'Connection with purpose' }, description: { ru: 'Вспомни, почему это важно для тебя.', en: 'Remember why this matters to you.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-21', type: 'mind', title: { ru: 'Критическое мышление', en: 'Critical thinking' }, description: { ru: 'Подвергни сомнению одно убеждение.', en: 'Question one of your beliefs.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-22', type: 'mind', title: { ru: 'Творческое решение', en: 'Creative solving' }, description: { ru: 'Найди нестандартное решение проблемы.', en: 'Find unconventional solution to problem.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-23', type: 'mind', title: { ru: 'Медитативное движение', en: 'Meditative movement' }, description: { ru: 'Медленно ходи и наблюдай все впечатления.', en: 'Walk slowly and observe all impressions.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-24', type: 'mind', title: { ru: 'Ясность через письмо', en: 'Clarity through writing' }, description: { ru: 'Напиши о проблеме 10 минут без остановки.', en: 'Write about problem for 10 minutes non-stop.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-25', type: 'mind', title: { ru: 'Сосредоточение на дыхании', en: 'Focus on breathing' }, description: { ru: 'Считай вдохи и выдохи в течение 5 минут.', en: 'Count breaths for 5 minutes.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-26', type: 'mind', title: { ru: 'Звуковая медитация', en: 'Sound meditation' }, description: { ru: 'Слушай окружающие звуки без оценок.', en: 'Listen to surrounding sounds without judgment.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-27', type: 'mind', title: { ru: 'Переформулирование', en: 'Reframing' }, description: { ru: 'Пересформулируй негативную мысль позитивно.', en: 'Reframe negative thought positively.' }, color: '#4c9cff', phase: 2 },
  { id: 'mind-28', type: 'mind', title: { ru: 'Экспансивное сознание', en: 'Expanded awareness' }, description: { ru: 'Чувствуй себя частью чего-то большего.', en: 'Feel yourself part of something bigger.' }, color: '#9f7dff', phase: 3 },
  { id: 'mind-29', type: 'mind', title: { ru: 'Четкая фокусировка', en: 'Sharp focus' }, description: { ru: 'Выбери одну задачу и посвяти ей полное внимание.', en: 'Choose one task and give it full attention.' }, color: '#5ac7ff', phase: 1 },
  { id: 'mind-30', type: 'mind', title: { ru: 'Состояние потока', en: 'State of flow' }, description: { ru: 'Войди в состояние полной поглощенности деятельностью.', en: 'Enter state of complete absorption in activity.' }, color: '#9f7dff', phase: 3 },
  { id: 'spirit-1', type: 'spirit', title: { ru: 'Мгновение благодарности', en: 'Moment of gratitude' }, description: { ru: 'Назови три вещи, за которые ты благодарен.', en: 'Name three things you are grateful for.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-2', type: 'spirit', title: { ru: 'Короткая медитация', en: 'Short meditation' }, description: { ru: '3 минуты дыхания и внутреннего спокойствия.', en: '3 minutes of breathing and inner calm.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-3', type: 'spirit', title: { ru: 'Осознанный отдых', en: 'Mindful rest' }, description: { ru: 'Отпусти напряжение после рабочего дня.', en: 'Release tension after the day.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-4', type: 'spirit', title: { ru: 'Связь с телом', en: 'Body connection' }, description: { ru: 'Слушай ощущения, не оценивая их.', en: 'Listen to sensations without judging them.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-5', type: 'spirit', title: { ru: 'Глубокая интуиция', en: 'Deep intuition' }, description: { ru: 'Спроси себя: что сейчас важно для меня?', en: 'Ask yourself: what matters most right now?' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-6', type: 'spirit', title: { ru: 'Разреши себе быть несовершенным', en: 'Allow imperfection' }, description: { ru: 'Разреши себе быть несовершенным сегодня.', en: 'Give yourself permission to be imperfect today.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-7', type: 'spirit', title: { ru: 'Энергия тишины', en: 'Energy of silence' }, description: { ru: 'Сидя спокойно, слушай внутренние ощущения.', en: 'Sit quietly and listen to inner sensations.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-8', type: 'spirit', title: { ru: 'Плавное восстановление', en: 'Gentle recovery' }, description: { ru: 'Медленное движение и мягкое дыхание.', en: 'Slow movement and soft breathing.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-9', type: 'spirit', title: { ru: 'Режим душевного ресурса', en: 'Soul resource mode' }, description: { ru: 'Отфильтруй одно «нельзя» и замени на «можно».', en: 'Filter one "can\'t" and replace it with "can".' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-10', type: 'spirit', title: { ru: 'Внутренний ресурс', en: 'Inner resource' }, description: { ru: 'Прими состояние, затем отпусти его.', en: 'Accept the feeling, then let it go.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-11', type: 'spirit', title: { ru: 'Звук вибрации', en: 'Vibrational sound' }, description: { ru: 'Произнеси звук и почувствуй вибрацию в теле.', en: 'Pronounce a sound and feel body vibration.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-12', type: 'spirit', title: { ru: 'Связь с землей', en: 'Connection with earth' }, description: { ru: 'Почувствуй себя заземленным и стабильным.', en: 'Feel grounded and stable.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-13', type: 'spirit', title: { ru: 'Безусловная любовь', en: 'Unconditional love' }, description: { ru: 'Направь любовь к себе и к окружающим.', en: 'Direct love to yourself and surroundings.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-14', type: 'spirit', title: { ru: 'Защита энергии', en: 'Energy protection' }, description: { ru: 'Визуализируй защитный кокон вокруг себя.', en: 'Visualize protective cocoon around yourself.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-15', type: 'spirit', title: { ru: 'Прощение практика', en: 'Forgiveness practice' }, description: { ru: 'Отпусти обиду и практикуй прощение.', en: 'Release resentment and practice forgiveness.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-16', type: 'spirit', title: { ru: 'Поток сострадания', en: 'Compassion flow' }, description: { ru: 'Позволь состраданию течь через тебя.', en: 'Allow compassion to flow through you.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-17', type: 'spirit', title: { ru: 'Космическое сознание', en: 'Cosmic awareness' }, description: { ru: 'Почувствуй связь со вселенной и всеми существами.', en: 'Feel connection with universe and all beings.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-18', type: 'spirit', title: { ru: 'Святой огонь', en: 'Sacred fire' }, description: { ru: 'Визуализируй святой огонь, очищающий душу.', en: 'Visualize sacred fire cleansing your soul.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-19', type: 'spirit', title: { ru: 'Цветок лотоса', en: 'Lotus flower' }, description: { ru: 'Медитируй на открытие и рост вашей сущности.', en: 'Meditate on opening and growth of your essence.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-20', type: 'spirit', title: { ru: 'Священное пространство', en: 'Sacred space' }, description: { ru: 'Создай внутреннее святилище спокойствия.', en: 'Create inner sanctuary of peace.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-21', type: 'spirit', title: { ru: 'Кристаллическая чистота', en: 'Crystal clarity' }, description: { ru: 'Очисти ум до кристальной ясности.', en: 'Purify mind to crystal clarity.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-22', type: 'spirit', title: { ru: 'Музыка сфер', en: 'Music of spheres' }, description: { ru: 'Слушай внутреннюю гармонию и ритм.', en: 'Listen to inner harmony and rhythm.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-23', type: 'spirit', title: { ru: 'Восхождение духа', en: 'Spirit ascension' }, description: { ru: 'Почувствуй возвышение и расширение сознания.', en: 'Feel elevation and expansion of consciousness.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-24', type: 'spirit', title: { ru: 'Божественный свет', en: 'Divine light' }, description: { ru: 'Наполнись божественным светом и мудростью.', en: 'Fill yourself with divine light and wisdom.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-25', type: 'spirit', title: { ru: 'Свидетель момента', en: 'Moment witness' }, description: { ru: 'Будь свидетелем текущего момента без участия.', en: 'Be witness of current moment without participation.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-26', type: 'spirit', title: { ru: 'Возвращение домой', en: 'Coming home' }, description: { ru: 'Почувствуй возвращение к сущности.', en: 'Feel return to your essence.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-27', type: 'spirit', title: { ru: 'Единство всего', en: 'Oneness of all' }, description: { ru: 'Осознай глубокое единство со всем сущим.', en: 'Realize deep oneness with all existence.' }, color: '#a564ff', phase: 2 },
  { id: 'spirit-28', type: 'spirit', title: { ru: 'Трансцендентный опыт', en: 'Transcendent experience' }, description: { ru: 'Выйди за границы обыденного сознания.', en: 'Transcend boundaries of ordinary consciousness.' }, color: '#bc8cff', phase: 3 },
  { id: 'spirit-29', type: 'spirit', title: { ru: 'Благословение жизни', en: 'Blessing of life' }, description: { ru: 'Благослови свою жизнь и всё, что в ней.', en: 'Bless your life and everything in it.' }, color: '#c683ff', phase: 1 },
  { id: 'spirit-30', type: 'spirit', title: { ru: 'Вечное пробуждение', en: 'Eternal awakening' }, description: { ru: 'Пребывай в состоянии вечного пробуждения.', en: 'Remain in state of eternal awakening.' }, color: '#bc8cff', phase: 3 },
];

const STORAGE_KEYS = {
  lastActiveDate: 'lastActiveDate',
  freezesCount: 'freezesCount',
  streak: 'streak',
  completedDaysTotal: 'completedDaysTotal',
  todayCompleted: 'todayCompleted',
  lastUsedChallengeIds: 'lastUsedChallengeIds',
  todayChallengeIds: 'todayChallengeIds',
  language: 'language',
} as const;

const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
type Language = typeof SUPPORTED_LANGUAGES[number];
const DEFAULT_LANGUAGE: Language = 'ru';

const defaultCompleted = [false, false, false] as const;
const DEFAULT_TODAY_CHALLENGE_IDS = ['body-1', 'mind-1', 'spirit-1'];

type TranslationSet = {
  headerTitle: string;
  todayTasks: string;
  streakLabel: string;
  freezesLabel: string;
  sectionSubtitle: string;
  howItWorksTitle: string;
  infoLines: string[];
  loadingText: string;
  modalTitle: string;
  modalPlaceholder: string;
  burnButtonText: string;
  congratsMessage: string;
  stepsTitle: string;
  completeChallengeButton: string;
  closeButtonLabel: string;
  completedLabel: string;
  pendingLabel: string;
  completedActionLabel: string;
  types: Record<ChallengeType, string>;
  phaseLabels: Record<1 | 2 | 3, string>;
  challenges: Record<string, { title: string; description: string }>;
};

const TRANSLATIONS: Record<Language, TranslationSet> = {
  ru: {
    headerTitle: 'Ежедневная дисциплина',
    todayTasks: 'Сегодняшние задания',
    streakLabel: 'Стрик',
    freezesLabel: 'Заморозки',
    sectionSubtitle: 'Закройте все 3 пункта, чтобы получить разгрузку.',
    howItWorksTitle: 'Как работает система',
    infoLines: [
      'Каждый день новые задания для тела, ума и духа.',
      'За 3/3 на сегодня вы сохраняете прогресс и открываете безопасную запись.',
      'Каждые 5 завершённых дней – +1 заморозка.',
    ],
    loadingText: 'Загружаем сегодняшние задания...',
    modalTitle: 'Анонимная разгрузка',
    modalPlaceholder: 'Всё остаётся только на телефоне. Выпиши ошибки и усталость дня...',
    burnButtonText: '🔥 Сжечь запись и отпустить',
    congratsMessage: 'Отличная работа! Все задания на сегодня закрыты, стрик сохранен!',
    stepsTitle: 'Пошаговая инструкция',
    completeChallengeButton: 'Завершить челлендж',
    closeButtonLabel: 'Закрыть',
    completedLabel: 'Выполнено',
    pendingLabel: 'Выполнить',
    completedActionLabel: 'Выполнить',
    types: { body: 'ТЕЛО', mind: 'УМ', spirit: 'ДУХ' },
    phaseLabels: {
      1: 'Фаза 1: Формирование привычки',
      2: 'Фаза 2: Углубление внимания',
      3: 'Фаза 3: Бесконечный режим спокойной мощности',
    },
    challenges: {},
  },
  en: {
    headerTitle: 'Daily Discipline',
    todayTasks: "Today's tasks",
    streakLabel: 'Streak',
    freezesLabel: 'Freezes',
    sectionSubtitle: 'Complete all 3 items to unlock release.',
    howItWorksTitle: 'How the system works',
    infoLines: [
      'New tasks for body, mind, and spirit every day.',
      'With 3/3 done you keep progress and open a safe note.',
      'Every 5 completed days grants +1 freeze.',
    ],
    loadingText: "Loading today's tasks...",
    modalTitle: 'Anonymous release',
    modalPlaceholder: "This stays only on your phone. Write down today's fatigue and mistakes...",
    burnButtonText: '🔥 Burn the note and let go',
    congratsMessage: 'Great work! All tasks for today are complete, streak preserved!',
    stepsTitle: 'Step-by-step instructions',
    completeChallengeButton: 'Complete challenge',
    closeButtonLabel: 'Close',
    completedLabel: 'Completed',
    pendingLabel: 'Complete',
    completedActionLabel: 'Do challenge',
    types: { body: 'BODY', mind: 'MIND', spirit: 'SPIRIT' },
    phaseLabels: {
      1: 'Phase 1: Building the habit',
      2: 'Phase 2: Deepening attention',
      3: 'Phase 3: Endless calm power',
    },
    challenges: {},
  },
};

function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
}

function localizeChallenge(challenge: ChallengeItem, language: Language): LocalizedChallengeItem {
  return {
    ...challenge,
    title: challenge.title[language],
    description: challenge.description[language],
  };
}

function isValidChallengeIds(ids: unknown): ids is string[] {
  return (
    Array.isArray(ids) &&
    ids.length === 3 &&
    ids.every((id) => typeof id === 'string' && TASKS_DATABASE.some((item) => item.id === id))
  );
}

function findChallengesByIds(ids: string[]): ChallengeItem[] {
  return ids
    .map((id) => TASKS_DATABASE.find((item) => item.id === id))
    .filter((item): item is ChallengeItem => Boolean(item));
}

function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateString(dateString: string): Date | null {
  const [year, month, day] = dateString.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateString(dateString: string | null): string | null {
  if (!dateString) return null;
  const parsed = parseDateString(dateString);
  if (!parsed) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetweenDates(fromDate: string, toDate: string): number {
  const from = parseDateString(fromDate);
  const to = parseDateString(toDate);
  if (!from || !to) return 0;
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / 86400000);
}

function getNextMidnightDelay(): number {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(0, nextMidnight.getTime() - now.getTime());
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getPhaseNumber(completedDaysTotal: number): 1 | 2 | 3 {
  if (completedDaysTotal >= 61) return 3;
  if (completedDaysTotal >= 31) return 2;
  return 1;
}

function getTasksForDay(dayIndex: number, phase: 1 | 2 | 3): ChallengeItem[] {
  const ROTATION_CYCLE = 30;
  const normalizedIndex = dayIndex % ROTATION_CYCLE;
  
  const phasePool = TASKS_DATABASE.filter((task) => task.phase <= phase);
  const bodyTasks = phasePool.filter((task) => task.type === 'body');
  const mindTasks = phasePool.filter((task) => task.type === 'mind');
  const spiritTasks = phasePool.filter((task) => task.type === 'spirit');
  
  const bodyTask = bodyTasks[normalizedIndex % bodyTasks.length];
  const mindTask = mindTasks[normalizedIndex % mindTasks.length];
  const spiritTask = spiritTasks[normalizedIndex % spiritTasks.length];
  
  return [bodyTask, mindTask, spiritTask].filter(Boolean);
}

function uniqueLastIds(previous: string[], todayIds: string[]): string[] {
  const combined = [...previous, ...todayIds];
  return combined.filter((id, index) => combined.indexOf(id) === index).slice(-6);
}

function buildDailyChallenges(
  completedDaysTotal: number,
  previousLastIds: string[],
  persistedIds: string[] | null,
): { challenges: ChallengeItem[]; todayIds: string[]; nextLastIds: string[] } {
  const phase = getPhaseNumber(completedDaysTotal);
  const validPersistedIds = Array.isArray(persistedIds) && persistedIds.length === 3 ? persistedIds : null;
  const persistedChallenges = validPersistedIds
    ? validPersistedIds.map((id) => TASKS_DATABASE.find((item) => item.id === id)).filter(
        (item): item is ChallengeItem => Boolean(item),
      )
    : [];

  if (validPersistedIds && persistedChallenges.length === 3) {
    return {
      challenges: persistedChallenges,
      todayIds: validPersistedIds,
      nextLastIds: uniqueLastIds(previousLastIds, validPersistedIds),
    };
  }

  const selectedChallenges = getTasksForDay(completedDaysTotal, phase);
  const todayIds = selectedChallenges.map((item) => item.id);
  return {
    challenges: selectedChallenges,
    todayIds,
    nextLastIds: uniqueLastIds(previousLastIds, todayIds),
  };
}

export default function ExploreScreen(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [freezesCount, setFreezesCount] = useState(5);
  const [streak, setStreak] = useState(0);
  const [completedDaysTotal, setCompletedDaysTotal] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState<boolean[]>([...defaultCompleted]);
  const [lastUsedChallengeIds, setLastUsedChallengeIds] = useState<string[]>([]);
  const [todayChallengeIds, setTodayChallengeIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null);
  const [isChallengeModalVisible, setIsChallengeModalVisible] = useState(false);

  const currentTexts = useMemo(() => TRANSLATIONS[language as Language], [language]);
  const currentPhaseLabel = useMemo(
    () => currentTexts.phaseLabels[getPhaseNumber(completedDaysTotal)],
    [completedDaysTotal, currentTexts],
  );
  const visibleChallenges = useMemo<ChallengeItem[]>(() =>
    todayChallengeIds
      .map((id: string) => TASKS_DATABASE.find((item) => item.id === id) ?? TASKS_DATABASE[0])
      .filter(Boolean),
    [todayChallengeIds],
  );

  const selectedLocalizedChallenge = selectedChallenge
    ? localizeChallenge(selectedChallenge, language)
    : null;

  const getChallengeSteps = useCallback(
    (challenge: LocalizedChallengeItem): string[] => {
      if (language === 'ru') {
        if (challenge.type === 'body') {
          return [
            'Сначала подготовьтесь: слегка разомните суставы и мышцы.',
            `Выполните задание: ${challenge.description}`,
            'Завершите практику мягкой растяжкой и прислушайтесь к телу.',
          ];
        }
        if (challenge.type === 'mind') {
          return [
            'Найдите спокойное место и сконцентрируйтесь на себе.',
            `Прочитайте задание и выполните его: ${challenge.description}`,
            'Отметьте, как изменилось ваше состояние, и сделайте паузу.',
          ];
        }
        return [
          'Настройтесь на внутреннее спокойствие и мягкое внимание.',
          `Выполните практику: ${challenge.description}`,
          'Поблагодарите себя за уделённое время и наблюдайте ощущения.',
        ];
      }

      if (challenge.type === 'body') {
        return [
          'Start with a light warm-up for your joints and muscles.',
          `Do the challenge: ${challenge.description}`,
          'Finish with gentle stretching and notice how your body feels.',
        ];
      }
      if (challenge.type === 'mind') {
        return [
          'Find a quiet place and focus on yourself.',
          `Read the challenge and complete it: ${challenge.description}`,
          'Notice how your state has changed and take a moment.',
        ];
      }
      return [
        'Settle into a calm inner state with soft attention.',
        `Do the practice: ${challenge.description}`,
        'Thank yourself for the time spent and observe the sensation.',
      ];
    },
    [language],
  );

  const handleOpenChallengeModal = useCallback(
    async (challenge: ChallengeItem): Promise<void> => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not available
      }
      setSelectedChallenge(challenge);
      setIsChallengeModalVisible(true);
    },
    [],
  );

  const handleChallengeModalClose = useCallback(() => {
    setSelectedChallenge(null);
    setIsChallengeModalVisible(false);
  }, []);

  const saveToStorage = useCallback(async (pairs: Array<[string, string]>): Promise<void> => {
    try {
      await AsyncStorage.multiSet(pairs);
    } catch {
      // Storage error - continue operation
    }
  }, []);

  const handleAllTasksCompleted = useCallback(async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }
    setShowConfetti(true);
    const nextStreak = streak + 1;
    const nextCompletedTotal = completedDaysTotal + 1;
    const nextFreezes = nextCompletedTotal % 5 === 0 ? freezesCount + 1 : freezesCount;

    setStreak(nextStreak);
    setCompletedDaysTotal(nextCompletedTotal);
    setFreezesCount(nextFreezes);
    setIsModalVisible(true);

    await saveToStorage([
      [STORAGE_KEYS.streak, String(nextStreak)],
      [STORAGE_KEYS.completedDaysTotal, String(nextCompletedTotal)],
      [STORAGE_KEYS.freezesCount, String(nextFreezes)],
    ]);
  }, [streak, completedDaysTotal, freezesCount, saveToStorage]);

  const handleCompleteSelectedChallenge = useCallback(async (): Promise<void> => {
    if (!selectedLocalizedChallenge) return;

    const index = visibleChallenges.findIndex((item) => item.id === selectedLocalizedChallenge.id);
    if (index === -1) return;

    const nextCompleted = [...todayCompleted];
    const hadAllDone = todayCompleted.every(Boolean);
    nextCompleted[index] = true;
    const allDone = nextCompleted.every(Boolean);

    setTodayCompleted(nextCompleted);
    await saveToStorage([[STORAGE_KEYS.todayCompleted, JSON.stringify(nextCompleted)]]);
    setIsChallengeModalVisible(false);
    setSelectedChallenge(null);

    if (!hadAllDone && allDone) {
      await handleAllTasksCompleted();
    }
  }, [selectedLocalizedChallenge, todayCompleted, visibleChallenges, saveToStorage, handleAllTasksCompleted]);

  const handleLanguageChange = useCallback(
    async (nextLanguage: Language): Promise<void> => {
      setLanguage(nextLanguage);
      await saveToStorage([[STORAGE_KEYS.language, nextLanguage]]);
    },
    [saveToStorage],
  );

  const loadState = useCallback(
    async (showLoading = false): Promise<void> => {
      if (showLoading) setIsLoading(true);

      try {
        const [
          rawLastDate,
          rawFreezes,
          rawStreak,
          rawCompleted,
          rawTodayCompleted,
          rawLastUsedIds,
          rawTodayIds,
          rawLanguage,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lastActiveDate),
          AsyncStorage.getItem(STORAGE_KEYS.freezesCount),
          AsyncStorage.getItem(STORAGE_KEYS.streak),
          AsyncStorage.getItem(STORAGE_KEYS.completedDaysTotal),
          AsyncStorage.getItem(STORAGE_KEYS.todayCompleted),
          AsyncStorage.getItem(STORAGE_KEYS.lastUsedChallengeIds),
          AsyncStorage.getItem(STORAGE_KEYS.todayChallengeIds),
          AsyncStorage.getItem(STORAGE_KEYS.language),
        ]);

        const today = getCurrentDateString();
        const normalizedSavedDate = normalizeDateString(rawLastDate) ?? today;
        const isSameDay = normalizedSavedDate === today;
        const selectedLanguage: Language = rawLanguage !== null && isSupportedLanguage(rawLanguage) ? rawLanguage : DEFAULT_LANGUAGE;

        setLanguage(selectedLanguage);

        const initialFreezes = rawFreezes !== null ? Number(rawFreezes) : 5;
        const initialStreak = rawStreak !== null ? Number(rawStreak) : 0;
        const initialCompleted = rawCompleted !== null ? Number(rawCompleted) : 0;
        const initialTodayCompleted = safeParse<boolean[]>(rawTodayCompleted, [...defaultCompleted]);
        const initialLastUsedIds = safeParse<string[]>(rawLastUsedIds, []);
        const initialTodayIds = safeParse<string[]>(rawTodayIds, []);

        let nextFreezes = initialFreezes;
        let nextStreak = initialStreak;
        let nextTodayCompleted = Array.isArray(initialTodayCompleted) ? initialTodayCompleted : [...defaultCompleted];
        let nextLastIds = Array.isArray(initialLastUsedIds) ? initialLastUsedIds : [];
        let activeDate = normalizedSavedDate;
        let todayIdsToUse: string[] | null = null;

        if (isSameDay && isValidChallengeIds(initialTodayIds)) {
          todayIdsToUse = initialTodayIds;
        }

        if (!isSameDay) {
          const daysDiff = daysBetweenDates(normalizedSavedDate, today);
          if (daysDiff === 1) {
            const previousDayCompleted = Array.isArray(initialTodayCompleted)
              ? initialTodayCompleted.every(Boolean)
              : false;
            if (!previousDayCompleted) {
              if (nextFreezes > 0) nextFreezes = Math.max(0, nextFreezes - 1);
              else nextStreak = 0;
            }
          } else if (daysDiff >= 2) {
            nextStreak = 0;
          }

          activeDate = today;
          nextTodayCompleted = [...defaultCompleted];
        }

        const dailyData = buildDailyChallenges(initialCompleted, nextLastIds, todayIdsToUse);

        setStreak(nextStreak);
        setFreezesCount(nextFreezes);
        setCompletedDaysTotal(initialCompleted);
        setTodayCompleted(nextTodayCompleted);
        setLastUsedChallengeIds(dailyData.nextLastIds);
        setTodayChallengeIds(dailyData.todayIds);

        await saveToStorage([
          [STORAGE_KEYS.lastActiveDate, activeDate],
          [STORAGE_KEYS.freezesCount, String(nextFreezes)],
          [STORAGE_KEYS.streak, String(nextStreak)],
          [STORAGE_KEYS.completedDaysTotal, String(initialCompleted)],
          [STORAGE_KEYS.todayCompleted, JSON.stringify(nextTodayCompleted)],
          [STORAGE_KEYS.lastUsedChallengeIds, JSON.stringify(dailyData.nextLastIds)],
          [STORAGE_KEYS.todayChallengeIds, JSON.stringify(dailyData.todayIds)],
          [STORAGE_KEYS.language, selectedLanguage],
        ]);
      } catch {
        setTodayChallengeIds(DEFAULT_TODAY_CHALLENGE_IDS);
        setLastUsedChallengeIds(DEFAULT_TODAY_CHALLENGE_IDS);
        setTodayCompleted([...defaultCompleted]);
      } finally {
        setIsLoading(false);
      }
    },
    [saveToStorage],
  );

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleMidnightRefresh = (): void => {
      const delay = getNextMidnightDelay();
      midnightTimer = setTimeout(async () => {
        await loadState(false);
        scheduleMidnightRefresh();
      }, delay);
    };

    loadState(true);
    scheduleMidnightRefresh();

    return () => {
      if (midnightTimer !== null) clearTimeout(midnightTimer);
    };
  }, [loadState]);

  const handleModalClose = useCallback(() => {
    setModalText('');
    setIsModalVisible(false);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9c8cff" />
          <Text style={styles.loadingText}>{currentTexts.loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>{currentTexts.headerTitle}</Text>
          <View style={styles.languageSwitcher}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langButton,
                  language === lang && styles.langButtonActive,
                ]}
                onPress={() => handleLanguageChange(lang)}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.langButtonText,
                    language === lang && styles.langButtonTextActive,
                  ]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.phaseText}>{currentPhaseLabel}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>🔥 {currentTexts.streakLabel}</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>🧊 {currentTexts.freezesLabel}</Text>
            <Text style={styles.statValue}>{freezesCount}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{currentTexts.todayTasks}</Text>
          <Text style={styles.sectionSubtitle}>{currentTexts.sectionSubtitle}</Text>
          {visibleChallenges.map((challenge, index: number) => {
            const completed = todayCompleted[index] ?? false;
            return (
              <TouchableOpacity
                key={challenge.id}
                activeOpacity={0.8}
                style={[
                  styles.challengeCard,
                  { borderColor: challenge.color, backgroundColor: completed ? '#14121b' : '#0a0910' },
                ]}
                onPress={() => handleOpenChallengeModal(challenge)}>
                <View style={styles.challengeHeader}>
                  <Text style={[styles.challengeType, { color: challenge.color }]}>[{currentTexts.types[challenge.type]}]</Text>
                  <Text style={[styles.challengeStatus, completed && styles.challengeCompleted]}>
                    {completed ? currentTexts.completedLabel : currentTexts.pendingLabel}
                  </Text>
                </View>
                <Text style={styles.challengeTitle}>{challenge.title[language]}</Text>
                <Text style={styles.challengeDescription}>{challenge.description[language]}</Text>
                <TouchableOpacity
                  style={[styles.challengeActionButton, completed && styles.challengeActionButtonCompleted]}
                  onPress={() => handleOpenChallengeModal(challenge)}
                  activeOpacity={0.8}>
                  <Text style={[styles.challengeActionButtonText, completed && styles.challengeActionButtonTextCompleted]}>
                    {completed ? currentTexts.completedActionLabel : currentTexts.pendingLabel}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{currentTexts.howItWorksTitle}</Text>
          {currentTexts.infoLines.map((line: string, index: number) => (
            <Text key={index} style={styles.infoText}>
              {line}
            </Text>
          ))}
        </View>
      </ScrollView>

      {showConfetti && (
        <ConfettiCannon
          count={120}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          fadeOut
          fallSpeed={3000}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
      <Modal
        visible={isChallengeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleChallengeModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedLocalizedChallenge?.title ?? ''}</Text>
              <TouchableOpacity onPress={handleChallengeModalClose} style={styles.closeButton} activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalCategory}>
              [{selectedLocalizedChallenge ? currentTexts.types[selectedLocalizedChallenge.type] : ''}]
            </Text>
            <Text style={styles.modalDescription}>{selectedLocalizedChallenge?.description}</Text>
            {selectedLocalizedChallenge && (
              <>
                <Text style={styles.stepsTitle}>{currentTexts.stepsTitle}</Text>
                {getChallengeSteps(selectedLocalizedChallenge).map((step, index) => (
                  <Text key={index} style={styles.stepText}>
                    {`${index + 1}. ${step}`}
                  </Text>
                ))}
              </>
            )}
            <TouchableOpacity
              style={styles.completeChallengeButton}
              onPress={handleCompleteSelectedChallenge}
              activeOpacity={0.8}>
              <Text style={styles.completeChallengeButtonText}>{currentTexts.completeChallengeButton}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalActionButton}
              onPress={handleChallengeModalClose}
              activeOpacity={0.8}>
              <Text style={styles.closeModalActionButtonText}>{currentTexts.closeButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentTexts.modalTitle}</Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton} activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.congratsText}>{currentTexts.congratsMessage}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={currentTexts.modalPlaceholder}
              placeholderTextColor="#7c7c8b"
              multiline
              value={modalText}
              onChangeText={setModalText}
            />
            <TouchableOpacity style={styles.burnButton} onPress={handleModalClose} activeOpacity={0.8}>
              <Text style={styles.burnButtonText}>{currentTexts.burnButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050407',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050407',
  },
  loadingText: {
    marginTop: 14,
    color: '#c7c4dc',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  phaseText: {
    color: '#9c8cff',
    fontSize: 15,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#11101a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2a3b',
  },
  statLabel: {
    color: '#7c77a1',
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#080711',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#272338',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#a79fd3',
    fontSize: 13,
    marginBottom: 18,
  },
  challengeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  challengeType: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  challengeStatus: {
    color: '#7c77a1',
    fontSize: 12,
  },
  challengeCompleted: {
    color: '#7fff8f',
  },
  challengeTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  challengeDescription: {
    color: '#c7c4dc',
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#0b0813',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2a2638',
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoText: {
    color: '#bfb8e0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f0c18',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#39304a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#1c172b',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  textInput: {
    minHeight: 140,
    color: '#ffffff',
    backgroundColor: '#0b0813',
    borderRadius: 18,
    padding: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2b2540',
    marginBottom: 18,
  },
  burnButton: {
    backgroundColor: '#ff6f7c',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  burnButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  languageSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0c18',
    borderWidth: 1,
    borderColor: '#2e2940',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  langButton: {
    minWidth: 46,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  langButtonActive: {
    backgroundColor: '#8f7bff',
    opacity: 1,
  },
  langButtonText: {
    color: '#e8e2ff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  langButtonTextActive: {
    color: '#ffffff',
  },
  challengeActionButton: {
    marginTop: 16,
    backgroundColor: '#1c1730',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  challengeActionButtonCompleted: {
    backgroundColor: '#241d3d',
    borderWidth: 1,
    borderColor: '#6f5dff',
  },
  challengeActionButtonText: {
    color: '#9c8cff',
    fontSize: 14,
    fontWeight: '700',
  },
  challengeActionButtonTextCompleted: {
    color: '#f2ebff',
  },
  modalCategory: {
    color: '#9c8cff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalDescription: {
    color: '#c7c4dc',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  stepsTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepText: {
    color: '#d1cfe6',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  completeChallengeButton: {
    backgroundColor: '#7b6fff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  completeChallengeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  closeModalActionButton: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5b5b75',
  },
  closeModalActionButtonText: {
    color: '#b7b2d9',
    fontSize: 15,
    fontWeight: '700',
  },
  congratsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
