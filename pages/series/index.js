import { gsap, Observer, ScrollTrigger, SplitText } from 'gsap/all'
import Swiper from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'

function init() {
	gsap.registerPlugin(ScrollTrigger, SplitText, Observer)
	let eventCount = 1

	const keyboardWrapper = document.querySelector('.keyboard-slider')
	const slides = gsap.utils.toArray('.keyboard-slide')
	const keyboardHeight = keyboardWrapper.getBoundingClientRect().height
	const slideWidth = Math.floor(keyboardHeight * 1.34)

	const angleInRadians = (7 * Math.PI) / 180
	const trackWidth = document.querySelector('.keyboard-slider').offsetWidth
	const xOffset = -trackWidth * 0.5
	const yOffset = -(Math.tan(angleInRadians) * trackWidth * 0.5)

	gsap.to('.keyboard-slider', {
		x: xOffset,
		y: yOffset,
		rotation: 7,
		duration: 0.5,
		ease: 'power2.out',
	})

	slides.forEach(slide => {
		slide.style.width = `${slideWidth}px`
	})

	// Настройка слайдера Swiper
	const keyboardSwiper = new Swiper(keyboardWrapper, {
		modules: [Navigation, Pagination],
		slidesPerView: 'auto',
		centeredSlides: true,
		navigation: {
			nextEl: '#podcast-btn-next',
			prevEl: '#podcast-btn-prev',
		},
		pagination: {
			el: '.new-podcast__pagination-track', // Контейнер для пагинации
			clickable: true,
			renderBullet: function (index, className) {
				// Если это последний слайд, возвращаем знак вопроса
				if (index === this.slides.length - 1) {
					return `<span class="${className}"><div class="text-gradient">?</div></span>`
				}
				// Для всех остальных слайдов возвращаем индекс
				return `<span class="${className}"><div class="text-gradient">${
					index + 1
				}</div></span>`
			},
		},

		onSlideChange: () => updateContentVisibility(), // Вызов функции обновления контента
	})

	// Логика для движения трека пагинации
	keyboardSwiper.on('slideChange', () => {
		movePaginationTrack()
	})

	function movePaginationTrack() {
		const paginationTrack = document.querySelector(
			'.new-podcast__pagination-track'
		)
		const activeBullet = paginationTrack.querySelector(
			'.swiper-pagination-bullet'
		)

		if (!activeBullet) return

		const bulletHeight = activeBullet.offsetHeight
		const activeIndex = keyboardSwiper.realIndex
		const offset = -activeIndex * bulletHeight

		// Применяем смещение
		paginationTrack.style.transform = `translateY(${offset}px)`
	}

	// Найти элементы
	const trigger = document.querySelector('.new-podcast__series-trigger')
	const triggerText = trigger.querySelector('p')
	const content = document.querySelector('.new-podcast__series-content')
	const items = document.querySelectorAll('.new-podcast_series-item')
	const selectIcon = document.querySelector('[data-element="pagination-icon"]')

	// Функция показа/скрытия селекта
	trigger.addEventListener('click', () => {
		const isVisible = gsap.getProperty(content, 'opacity') === 1

		if (isVisible) {
			// Скрыть контент
			gsap.to(content, { opacity: 0, pointerEvents: 'none', duration: 0.3 })
			gsap.to(selectIcon, { rotation: 0, duration: 0.3 })
		} else {
			// Показать контент
			gsap.to(content, { opacity: 1, pointerEvents: 'auto', duration: 0.3 })
			gsap.to(selectIcon, { rotation: 180, duration: 0.3 })
		}
	})

	const playSection = document.querySelector('.new-podcast__section--play')
	const podcastItems = document.querySelectorAll('.podcast-item')

	// Функция для обновления видимости контента
	function updateContentVisibility() {
		const activeSlideIndex = keyboardSwiper.activeIndex

		// Обновляем карточки селекта
		items.forEach((item, index) => {
			if (index === activeSlideIndex - 1) {
				// Сопоставление слайдов и карточек
				item.classList.add('active') // Добавляем класс активной карточке
			} else {
				item.classList.remove('active') // Убираем класс с неактивных
			}
		})

		// Анимация видимости блоков (оставляем вашу текущую логику)
		podcastItems.forEach(item => {
			const slideIndex = parseInt(item.getAttribute('data-slide'), 10)
			if (slideIndex === activeSlideIndex + 2) {
				gsap.to(item, { visibility: 'visible', opacity: 1, duration: 0.5 })
			} else {
				gsap.to(item, { visibility: 'hidden', opacity: 0, duration: 0.5 })
				gsap.to(selectIcon, { rotation: 0, duration: 0.5 })
			}
		})
	}

	class Podcast {
		constructor() {
			this.keySlider = {
				maxCount: keyboardSwiper.slides.length,
				currentCount: 0,
			}
			this.isAnimating = false
		}

		keySliderAnimate(direction) {
			if (this.isAnimating) return
			this.isAnimating = true

			setTimeout(() => {
				this.isAnimating = false
			}, 1000)

			if (
				direction >= 0 &&
				this.keySlider.currentCount < this.keySlider.maxCount - 1
			) {
				this.keySlider.currentCount++
				keyboardSwiper.slideTo(this.keySlider.currentCount)
			} else if (direction < 0 && this.keySlider.currentCount > 0) {
				this.keySlider.currentCount--
				keyboardSwiper.slideTo(this.keySlider.currentCount)
			}

			updateContentVisibility()
			console.log(`KeySlider Animation Step: ${this.keySlider.currentCount}`)
		}

		masterAnimate(direction) {
			if (direction > 0) {
				this.keySliderAnimate(direction)
				// }
			} else if (direction < 0) {
				if (this.keySlider.currentCount > 0) {
					this.keySliderAnimate(direction)
				}
			}
		}
	}

	keyboardSwiper.on('slideChange', () => {
		podcastAnimation.keySlider.currentCount = keyboardSwiper.activeIndex
		updateContentVisibility()
	})

	const podcastAnimation = new Podcast()
	let lastTouchX = 0
	let lastTouchY = 0

	// Обработчик touchstart для сохранения координат
	document.addEventListener('touchstart', event => {
		if (event.touches && event.touches[0]) {
			lastTouchX = event.touches[0].clientX
			lastTouchY = event.touches[0].clientY
		} else {
			console.error(
				'Событие touchstart не содержит данных о координатах:',
				event
			)
		}
		console.log('Координаты touchstart:', { lastTouchX, lastTouchY })
	})

	// Проверка, находится ли событие внутри селекта
	function isInsideContent(event) {
		const selectContent = document.querySelector('.new-podcast__series-options')
		if (!selectContent) {
			console.error('Элемент .new-podcast__series-options не найден.')
			return false
		}

		const rect = selectContent.getBoundingClientRect()

		// Используем глобальные координаты
		const pointerX = lastTouchX
		const pointerY = lastTouchY

		console.log({
			rect,
			pointerX,
			pointerY,
		})

		const isInside =
			pointerX >= rect.left &&
			pointerX <= rect.right &&
			pointerY >= rect.top &&
			pointerY <= rect.bottom

		console.log('Результат проверки:', isInside)
		return isInside
	}

	// Observer для wheel
	Observer.create({
		target: window,
		type: 'wheel',
		onUp: event => {
			if (isInsideContent(event)) {
				console.log('Скролл внутри селекта. Игнорируем событие.')
				return
			}
			podcastAnimation.masterAnimate(-1)
		},
		onDown: event => {
			if (isInsideContent(event)) {
				console.log('Скролл внутри селекта. Игнорируем событие.')
				return
			}
			podcastAnimation.masterAnimate(1)
		},
	})

	// Observer для touch
	Observer.create({
		target: window,
		type: 'touch',
		onUp: event => {
			console.log('Событие onUp:', event)
			if (isInsideContent(event)) {
				console.log('Скролл внутри селекта. Игнорируем событие.')
				return
			}
			podcastAnimation.masterAnimate(1)
			updateContentVisibility()
		},
		onDown: event => {
			console.log('Событие onDown:', event)
			if (isInsideContent(event)) {
				console.log('Скролл внутри селекта. Игнорируем событие.')
				return
			}
			podcastAnimation.masterAnimate(-1)
			updateContentVisibility()
		},
	})

	// Обработчик wheel для блока селекта
	const selectContent = document.querySelector('.new-podcast__series-options')
	if (selectContent) {
		selectContent.addEventListener('wheel', event => {
			event.stopImmediatePropagation()
		})
	}

	// Обработчик wheel для блока селектаы
	if (selectContent) {
		selectContent.addEventListener('touch', event => {
			event.stopImmediatePropagation()
		})
	}

	// Обработка смены слайда с помощью кнопок навигации
	keyboardSwiper.on('slideChange', () => {
		podcastAnimation.keySlider.currentCount = keyboardSwiper.activeIndex
		updateContentVisibility()
	})

	// Находим элементы модалки
	const modal = document.querySelector('.podcast-modal-ytb')
	const iframe = modal.querySelector('.iframe-podcast') // iframe для видео
	const modalTitle = modal.querySelector('.modal-ytb-title') // заголовок в модалке
	const closeModalBtn = modal.querySelector('.podcast-modal__ytb-close-btn')

	// Функция открытия модалки с заданным src и заголовком
	function openModalWithVideo(src, title) {
		// Проверяем, если текущий src iframe отличается от нового src
		if (iframe.src !== src) {
			iframe.src = src // Устанавливаем новый src для iframe
		}

		// Устанавливаем текст заголовка
		const titleElement = document.querySelector('.modal-ytb-title')
		if (titleElement && titleElement.textContent !== title) {
			titleElement.textContent = title // Устанавливаем новый текст заголовка
		}

		// Устанавливаем display: flex и начинаем анимацию opacity
		modal.style.display = 'flex'
		gsap.fromTo(
			modal,
			{ opacity: 0 },
			{
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out',
			}
		)
	}

	function closeModal() {
		gsap.to(modal, {
			opacity: 0,
			duration: 0.3,
			ease: 'power2.in',
			onComplete: () => {
				setTimeout(() => {
					modal.style.display = 'none' // Устанавливаем display: none после завершения анимации
					iframe.src = '' // Очищаем src после скрытия, если нужно
				}, 300) // Задержка перед установкой display: none
			},
		})
	}

	// Назначаем обработчик клика на каждую кнопку
	document
		.querySelectorAll('.new-podcast-play__button-play')
		.forEach(button => {
			button.addEventListener('click', () => {
				const videoSrc = button.getAttribute('data-src')
				const videoTitle = button.getAttribute('data-title')
				openModalWithVideo(videoSrc, videoTitle)
			})
		})

	// Назначаем обработчик для закрытия модалки
	closeModalBtn.addEventListener('click', closeModal)
}

// Инициализация
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init)
} else if (document.readyState === 'complete') {
	init()
}
