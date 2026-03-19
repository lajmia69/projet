interface DurationDisplayProps {
	isoDuration: string;
	format?: 'short' | 'long' | 'seconds';
}

export default function DurationDisplay({ isoDuration, format = 'short' }: DurationDisplayProps) {
	const parseDuration = (duration: string): number => {
		const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

		if (!match) return 0;

		const [, days, hours, minutes, seconds] = match;
		return (
			parseInt(days || '0') * 86400 +
			parseInt(hours || '0') * 3600 +
			parseInt(minutes || '0') * 60 +
			parseInt(seconds || '0')
		);
	};

	const formatDuration = (totalSeconds: number): string => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		switch (format) {
			case 'seconds':
				return `${totalSeconds}s`;
			case 'long':
				if (hours > 0) {
					return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
				}

				return `${minutes} minutes, ${seconds} seconds`;
			case 'short':
			default:
				if (hours > 0) {
					return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
				}

				return `${minutes}:${seconds.toString().padStart(2, '0')}`;
		}
	};

	const totalSeconds = parseDuration(isoDuration);

	return <span className="leading-none whitespace-nowrap">{formatDuration(totalSeconds)}</span>;
}

// Usage
// const App = () => {
// 	return (
// 		<div>
// 			<DurationDisplay isoDuration="P0DT00H08M35S" />
// 			{/* Renders: 8:35 */}
//
// 			<DurationDisplay
// 				isoDuration="P0DT00H08M35S"
// 				format="long"
// 			/>
// 			{/* Renders: 8 minutes, 35 seconds */}
//
// 			<DurationDisplay
// 				isoDuration="P0DT00H08M35S"
// 				format="seconds"
// 			/>
// 			{/* Renders: 515s */}
// 		</div>
// 	);
// };
