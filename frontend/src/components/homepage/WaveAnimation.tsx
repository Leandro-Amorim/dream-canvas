import { useEffect, useRef } from "react";
import useResizeObserver from "use-resize-observer";
import { motion } from "framer-motion";
const pi = Math.PI;
const pi2 = 2 * Math.PI;

export default function WaveAnimation() {

	const { ref: wrapperRef, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const requestRef = useRef<number>(0);

	const systemRef = useRef<System>({
		radius: 0,
		centerX: 0,
		centerY: 0,
		scale: 1,
		width: 0,
		height: 0,
		options: {
			width: 250,
			rotation: 0,
			amplitude: 0.3
		},
		waves: Array.from({ length: 5 }).map((el, i) => createWave([0.002, 0.004], 9 + i / 2))
	})

	const animate = () => {
		clear(systemRef.current, canvasRef.current?.getContext('2d') ?? null);

		for (let i = 0; i < systemRef.current.waves.length; i++) {
			updateWave(systemRef.current.waves[i], systemRef.current);
			drawWave(systemRef.current.waves[i], systemRef.current, canvasRef.current?.getContext('2d') ?? null);
		}

		requestRef.current = requestAnimationFrame(animate);
	}

	function onResize(width: number, height: number) {
		resize(systemRef.current, canvasRef.current, width, height);
	}
	useEffect(() => {
		onResize(width, height);
	}, [width, height])

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, []);

	return (
		<motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 2, }} className="absolute w-full h-[570px]" ref={wrapperRef}>
			<canvas className="w-full h-full" ref={canvasRef} />
		</motion.div >
	)
}

interface System {
	radius: number,
	centerX: number,
	centerY: number,
	scale: number,
	width: number,
	height: number,
	options: {
		width: number,
		rotation: number,
		amplitude: number
	},
	waves: Wave[]
}

interface Wave {
	lines: Line[],
	angle: number[],
	speed: number[],
	color: string,
}

interface Line {
	angle: number[];
	color: string;
}

function resize(system: System, canvas: HTMLCanvasElement | null, width: number, height: number) {

	system.scale = window.devicePixelRatio || 1;
	system.width = width * system.scale;
	system.height = height * system.scale;

	if (canvas !== null) {
		canvas.width = system.width;
		canvas.height = system.height;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
	}

	system.radius = Math.sqrt(Math.pow(system.width, 2) + Math.pow(system.height, 2)) / 2;
	system.centerX = system.width / 2;
	system.centerY = system.height / 2;
}

function clear(system: System, ctx: CanvasRenderingContext2D | null) {
	ctx?.clearRect(0, 0, system.width, system.height);
}

function createWave(speed: number[], hue: number): Wave {

	const a = Math.floor(127 * Math.sin(0.3 * hue + 0) + 128);
	const b = Math.floor(127 * Math.sin(0.3 * hue + 2) + 128);
	const c = Math.floor(127 * Math.sin(0.3 * hue + 4) + 128);

	const color = 'rgba(' + a + ',' + b + ',' + c + ', 0.05)';

	return {
		lines: [],
		angle: [
			rnd(pi2),
			rnd(pi2),
			rnd(pi2),
			rnd(pi2)
		],
		speed: [
			rnd(speed[0], speed[1]) * rnd_sign(),
			rnd(speed[0], speed[1]) * rnd_sign(),
			rnd(speed[0], speed[1]) * rnd_sign(),
			rnd(speed[0], speed[1]) * rnd_sign(),
		],
		color

	}
}

function createLine(wave: Wave): Line {

	const angle = wave.angle;
	const speed = wave.speed;
	return {
		angle: [
			Math.sin(angle[0] += speed[0]),
			Math.sin(angle[1] += speed[1]),
			Math.sin(angle[2] += speed[2]),
			Math.sin(angle[3] += speed[3])
		],
		color: wave.color,
	};
}

function updateWave(wave: Wave, system: System) {
	const lines = wave.lines;

	lines.push(createLine(wave));

	if (lines.length > system.options.width) {
		lines.shift();
	}
}

function drawWave(wave: Wave, system: System, ctx: CanvasRenderingContext2D | null) {

	const radius = system.radius;
	const radius3 = radius / 3;
	const x = system.centerX;
	const y = system.centerY;
	const rotation = dtr(system.options.rotation);
	const amplitude = system.options.amplitude;

	const lines = wave.lines;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		const angle = line.angle;

		const x1 = 0;
		const y1 = system.height - i * 1;
		const x2 = x + radius * Math.cos(angle[3] * amplitude + rotation);
		const y2 = y + radius * Math.sin(angle[3] * amplitude + rotation);
		const cpx1 = x - radius3 * Math.cos(angle[1] * amplitude * 2);
		const cpy1 = y - radius3 * Math.sin(angle[1] * amplitude * 2);
		const cpx2 = x + radius3 * Math.cos(angle[1] * amplitude * 2);
		const cpy2 = y + radius3 * Math.sin(angle[1] * amplitude * 2);

		if (ctx === null) { continue; }

		ctx.strokeStyle = line.color;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
		ctx.stroke();
	}
}

function dtr(deg: number) {
	return deg * pi / 180;
}

function rnd(a: number, b?: number) {
	if (b === undefined) {
		return Math.random() * a;
	}
	else {
		return a + Math.random() * (b - a);
	}
}

function rnd_sign() {
	return (Math.random() > 0.5) ? 1 : -1;
}
