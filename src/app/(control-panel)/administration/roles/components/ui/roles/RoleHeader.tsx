import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import useParams from '@fuse/hooks/useParams';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { Role, CreateRole } from '@/app/(control-panel)/administration/roles/api/types';
import { useCreateRole } from '@/app/(control-panel)/administration/roles/api/hooks/useCreateRole';
import { useUpdateRole } from '@/app/(control-panel)/administration/roles/api/hooks/useUpdateRole';
import { useDeleteRole } from '@/app/(control-panel)/administration/roles/api/hooks/useDeleteRole';
import useUser from '@auth/useUser';
import { useSnackbar } from 'notistack';

function RoleHeader() {
	const routeParams = useParams<{ roleId: string }>();
	const { roleId } = routeParams;
	const { data: currentAccount } = useUser();
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();

	const { mutate: createRole } = useCreateRole(currentAccount.token);
	const { mutate: updateRole } = useUpdateRole(currentAccount.token);
	const { mutate: deleteRole } = useDeleteRole(currentAccount.token);

	const methods = useFormContext();
	const { formState, getValues, watch } = methods;
	const { isValid, dirtyFields } = formState;

	const { name } = watch() as Role;

	function handleCreateRole() {
		createRole(getValues() as CreateRole, {
			onSuccess: () => {
				enqueueSnackbar('Role created successfully', { variant: 'success' });
				navigate('/administration/roles');
			},
			onError: () => {
				enqueueSnackbar('Failed to create role', { variant: 'error' });
			}
		});
	}

	function handleSaveRole() {
		updateRole(getValues() as Role, {
			onSuccess: () => {
				enqueueSnackbar('Role updated successfully', { variant: 'success' });
			},
			onError: () => {
				enqueueSnackbar('Failed to update role', { variant: 'error' });
			}
		});
	}

	function handleRemoveRole() {
		deleteRole(parseInt(roleId), {
			onSuccess: () => {
				enqueueSnackbar('Role deleted successfully', { variant: 'success' });
				navigate('/administration/roles');
			},
			onError: () => {
				enqueueSnackbar('Failed to delete role', { variant: 'error' });
			}
		});
	}

	return (
		<div className="flex flex-auto flex-col py-4">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.div
						className="flex min-w-0 flex-col"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="truncate text-lg font-semibold sm:text-2xl">
							{name || 'New Role'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							Role Detail
						</Typography>
					</motion.div>
				</div>
				<motion.div
					className="flex w-full flex-1 justify-end"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
				>
					{roleId !== 'new' ? (
						<>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="error"
								onClick={handleRemoveRole}
								startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							>
								Remove
							</Button>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="secondary"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								onClick={handleSaveRole}
							>
								Save
							</Button>
						</>
					) : (
						<Button
							className="mx-1 whitespace-nowrap"
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleCreateRole}
						>
							Add
						</Button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

export default RoleHeader;