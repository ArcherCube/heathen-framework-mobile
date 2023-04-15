function flexible(window: Window, document: Document) {
	const docEl = document.documentElement;
	const dpr: number = window.devicePixelRatio || 1;

	let timer: NodeJS.Timeout | undefined = undefined;

	/**
	 * 更新window的rem单位，设置 1rem = viewWidth / 10。在短时间内的连续变化中，最后一次变化才会触发更新事件。
	 */
	function setRemUnit() {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			const rem = docEl.clientWidth / 10;
			docEl.style.fontSize = `${rem}px`;
			(window as any).rem = rem;

			const event = new CustomEvent('flexible', {
				detail: {
					remUnit: rem
				},
				bubbles: true, //冒泡
				cancelable: false //不可取消
			});
			window.dispatchEvent && window.dispatchEvent(event);
		}, 100);
	}
	setRemUnit();

	// 当页面尺寸变化时，重置rem单位
	window.addEventListener('resize', setRemUnit);
	window.addEventListener('pageshow', function (event) {
		if (event.persisted) {
			setRemUnit();
		}
	});

	// detect 0.5px supports
	if (dpr >= 2) {
		const fakeBody = document.createElement('body');
		const testElement = document.createElement('div');
		testElement.style.border = '.5px solid transparent';
		fakeBody.appendChild(testElement);
		docEl.appendChild(fakeBody);
		if (testElement.offsetHeight === 1) {
			docEl.classList.add('hairlines');
		}
		docEl.removeChild(fakeBody);
	}
};

flexible(window, document);