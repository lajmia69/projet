import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MainProjectSelection from '@/components/MainProjectSelection';
import clsx from 'clsx';

const Root = styled('div')(({ theme }) => ({
	'& > .logo-icon': {
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	},
	'& > .badge': {
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

type LogoProps = {
	className?: string;
};

/**
 * The logo component.
 */
function Logo(props: LogoProps) {
	const { className = '' } = props;
	return (
		<Root className={clsx('flex flex-shrink-0 flex-grow items-center gap-3', className)}>
            <div className="flex flex-1 flex-col items-center gap-2">
                <img
                    className="logo-icon"
                    src="/assets/images/logo/logo.png"
                    alt="logo"
                    style={{ height: 'auto', maxHeight: 48, width: 'auto', objectFit: 'contain' }}
                />
            </div>
			<MainProjectSelection />
		</Root>
	);
}

export default Logo;
