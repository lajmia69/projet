import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Button from '@mui/material/Button';
import { signIn } from 'next-auth/react';
import { Alert, InputAdornment } from '@mui/material';
import { Visibility as EyeIcon, VisibilityOff as EyeOffIcon } from '@mui/icons-material';
import signinErrors from './signinErrors';

/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
	password: z
		.string()
		.min(4, 'Password is too short - must be at least 4 chars.')
		.nonempty('Please enter your password.'),
	remember: z.boolean().optional()
});

type FormType = z.infer<typeof schema>;

const defaultValues = {
	email: '',
	password: '',
	remember: true
};

function AuthJsCredentialsSignInForm() {
  const router = useRouter();
  const { control, formState, handleSubmit, setValue, setError } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  const { isValid, dirtyFields, errors } = formState;
  const [showPassword, setShowPassword] = useState(false);

	// useEffect(() => {
	// 	setValue('email', 'admin@fusetheme.com', {
	// 		shouldDirty: true,
	// 		shouldValidate: true
	// 	});
	// 	setValue('password', '5;4+0IOx:\\Dy', {
	// 		shouldDirty: true,
	// 		shouldValidate: true
	// 	});
	// }, [setValue]);

	async function onSubmit(formData: FormType) {
		const { email, password } = formData;

		const result = await signIn('credentials', {
			email,
			password,
			formType: 'signin',
			redirect: false
		});

		if (result?.error) {
			setError('root', { type: 'manual', message: signinErrors[result.error] });
			router.replace(`/sign-in?error=${result.error}`, { scroll: false });
			return false;
		}

		return true;
	}

	return (
		<form
			name="loginForm"
			noValidate
			className="flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>
			{errors?.root?.message && (
				<Alert
					className="mb-8"
					severity="error"
					sx={(theme) => ({
						backgroundColor: theme.palette.error.light,
						color: theme.palette.error.dark
					})}
				>
					{errors?.root?.message}
				</Alert>
			)}
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        className="mb-6"
                        label="Email"
                        autoFocus
                        type="email"
                        error={!!errors.email}
                        helperText={errors?.email?.message}
                        variant="outlined"
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-6"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors?.password?.message}
                  variant="outlined"
                  required
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          variant="text"
                          size="small"
                          aria-label="toggle password visibility"
                          className="p-0"
                        >
                          {showPassword ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
                        </Button>
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
			<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
				<Controller
					name="remember"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label="Remember me"
								control={
									<Checkbox
										size="small"
										{...field}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				<MuiLink
					href="/forgot-password"
					underline="hover"
					sx={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
				>
					Forgot password?
				</MuiLink>
			</div>
			<Button
				variant="contained"
				color="secondary"
				className="mt-4 w-full"
				aria-label="Sign in"
				disabled={_.isEmpty(dirtyFields) || !isValid}
				type="submit"
				size="large"
			>
				Sign in
			</Button>
		</form>
	);
}

export default AuthJsCredentialsSignInForm;
