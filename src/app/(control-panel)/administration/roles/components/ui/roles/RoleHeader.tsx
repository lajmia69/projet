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
import useUser from '@auth/useUser';
import { enqueueSnackbar } from 'notistack';
// import { Product } from '../../../api/types';
// import { useCreateProduct } from '../../../api/hooks/products/useCreateProduct';
// import { useUpdateProduct } from '../../../api/hooks/products/useUpdateProduct';
// import { useDeleteProduct } from '../../../api/hooks/products/useDeleteProduct';

/**
 * The role header.
 */
function RoleHeader() {
	const routeParams = useParams<{ roleId: string }>();
	const { roleId } = routeParams;
	const { data: currentAccount } = useUser();
	const { mutate: createRole } = useCreateRole(currentAccount.token);
	// const { mutate: saveProduct } = useUpdateProduct();
	// const { mutate: removeProduct } = useDeleteProduct();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();

	const { name } = watch() as Role;

	function handleSaveRole() {
		// console.log(getValues() as CreateRole);
		// 	saveProduct(getValues() as CreateRole);
	}

	function handleCreateRole() {
		// console.log(getValues() as CreateRole);

		createRole(getValues() as CreateRole);

		// if (result) {
		// 	navigate('/administration/roles');
		// 	enqueueSnackbar('NOT FOUND', {
		// 		variant: 'error'
		// 	});
		// }
	}

	function handleRemoveRole() {
		// removeProduct(roleId);
		navigate('/administration/roles');
	}

	return (
		<div className="flex flex-auto flex-col py-4">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.div
						className="hidden sm:flex"
						initial={{ scale: 0 }}
						animate={{ scale: 1, transition: { delay: 0.3 } }}
					>
						{/*{images && images.length > 0 && featuredImageId ? (*/}
						{/*	<img*/}
						{/*		className="w-8 rounded-sm sm:w-12"*/}
						{/*		src={_.find(images, { id: featuredImageId })?.url}*/}
						{/*		alt={name}*/}
						{/*	/>*/}
						{/*) : (*/}
						{/*	<img*/}
						{/*		className="w-8 rounded-sm sm:w-12"*/}
						{/*		src="/assets/images/apps/ecommerce/product-image-placeholder.png"*/}
						{/*		alt={name}*/}
						{/*	/>*/}
						{/*)}*/}
					</motion.div>
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
								color="secondary"
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
