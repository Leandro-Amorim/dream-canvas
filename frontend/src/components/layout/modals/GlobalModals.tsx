import PostModal from "@/components/explore/PostModal";
import BlockUserModal from "./BlockUserModal";
import DeletePostModal from "./DeletePostModal";
import ReportPostModal from "./ReportPostModal";
import SharePostModal from "./SharePostModal";
import SigninModal from "./SigninModal";
import UnblockUserModal from "./UnblockUserModal";

export default function GlobalModals() {
	return (
		<>
			<SigninModal />
			<PostModal />
			<BlockUserModal/>
			<UnblockUserModal/>
			<ReportPostModal/>
			<DeletePostModal/>
			<SharePostModal/>
		</>
	)
}