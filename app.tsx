
import * as React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

//polyfill补充
import '@/polyfill';
//全局配置
import '@/config';

//页面集合
import pages from 'pages';

//页面包裹组件
import PageWrapper from 'utils/page-wrapper';

function App() {
	return (
		<HashRouter>
			<Routes>
				{
					pages.map((page) => {
						const Component = page.component ?? null;

						return (
							<Route
								path={page.path}
								key={page.path}
								element={
									<PageWrapper
										title={page.title}
									>
										{
											Component ?
												<Component />
												:
												`找不到页面“${page.title}”, 请检查页面配置。`
										}
									</PageWrapper>
								}
							/>
						);
					})
				}
			</Routes>
		</HashRouter>
	);
}
export default App;