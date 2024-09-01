import { Flex } from "@chakra-ui/react"
import {
  getAllStorageGoods,
  getStorageGoodsCount,
} from "api/storage/storageGood"
import { Container } from "component/Container"
import { SearchFiltersClearBtn } from "component/customTable/SearchFiltersClearBtn"
import { LoadingPage } from "component/page/LoadingPage"
import { Page } from "component/page/Page"
import { PageHeading } from "component/page/PageHeading"
import { Pagination } from "component/page/Pagination"
import { RowsPerPageSelect } from "component/page/RowsPerPageSelect"
import { StorageGoodsFilters } from "component/storageGood/StorageGoodsFilters"
import { StorageGoodsTable } from "component/storageGood/StorageGoodsTable"
import { usePaginationContext } from "context/pagination"
import { useTableContext } from "context/table"
import { usePagination } from "hook/usePagination"
import { useShopFilter } from "hook/useShopFilter"
import { useEffect } from "react"
import { useQuery } from "react-query"
import { PageProps } from "type/page/page"
import { StorageGood, StorageGoodSearchFilter } from "type/storage/storageGood"
import { WithId } from "type/withId"

export const Storage = (props: PageProps) => {
  const { guideNotionPageId } = props

  const { currentPage, setCurrentPage, resetCurrentPage, offset, setOffset } =
    usePagination()
  const { rowsPerPageCount } = usePaginationContext()
  const { selectedShopId, handleShopSelect } = useShopFilter()
  const { sortDirection, sortField, searchFilter } =
    useTableContext<StorageGoodSearchFilter>()

  const {
    data: storageGoodsList,
    isLoading: isLoadingStorageGoodsList,
    refetch,
    isRefetching: isRefetchingStorageGoodsList,
  } = useQuery<WithId<StorageGood>[]>("storageGoodsList", () =>
    getAllStorageGoods(
      rowsPerPageCount,
      offset,
      selectedShopId,
      sortField,
      sortDirection,
      searchFilter,
    ),
  )

  const { data: storageGoodsCount, isLoading: isLoadingStorageGoodsCount } =
    useQuery<number>("storageGoodsCount", getStorageGoodsCount)

  const isLoading = isLoadingStorageGoodsList || isLoadingStorageGoodsCount

  const isRefetching = isRefetchingStorageGoodsList

  const isStorageGoodsExist = storageGoodsList !== undefined

  useEffect(() => {
    const newOffset = currentPage * rowsPerPageCount
    setOffset(newOffset)
  }, [setOffset, currentPage, rowsPerPageCount])

  useEffect(() => {
    refetch()
  }, [
    refetch,
    offset,
    rowsPerPageCount,
    selectedShopId,
    sortDirection,
    sortField,
    searchFilter,
  ])

  return (
    <Page guideNotionPageId={guideNotionPageId}>
      <PageHeading title="Storage" isSearchHidden />

      <Container>
        <Flex w="full" justifyContent="space-between">
          <StorageGoodsFilters handleShopSelect={handleShopSelect} />

          <Flex alignItems="center" gap={2}>
            <SearchFiltersClearBtn isLoading={isLoading || isRefetching} />

            <RowsPerPageSelect isLoading={isLoading || isRefetching} />
          </Flex>
        </Flex>

        {!isStorageGoodsExist && isLoading && <LoadingPage />}

        {isStorageGoodsExist && !isLoading && (
          <>
            <StorageGoodsTable
              storageGoodsList={storageGoodsList}
              selectedShopId={selectedShopId}
              resetCurrentPage={resetCurrentPage}
            />

            <Pagination
              totalItemsCount={storageGoodsCount}
              currentPage={currentPage}
              handlePageChange={setCurrentPage}
              isLoading={isLoading || isRefetching}
            />
          </>
        )}
      </Container>
    </Page>
  )
}
