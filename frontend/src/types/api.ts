export type GenericAPIResponse<T> = ErrorResponse | DataResponse<T>;

interface ErrorResponse {
	status: 'error',
	reason: string
}
interface DataResponse<T> {
	status: 'success',
	data: T
}