/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'vs/css!./currentLineMarginHighlight';
import { DynamicViewOverlay } from 'vs/editor/browser/view/dynamicViewOverlay';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import { IRenderingContext } from 'vs/editor/common/view/renderingContext';
import * as viewEvents from 'vs/editor/common/view/viewEvents';

export class CurrentLineMarginHighlightOverlay extends DynamicViewOverlay {
	private _context: ViewContext;
	private _lineHeight: number;
	private _renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
	private _primaryCursorIsInEditableRange: boolean;
	private _primaryCursorLineNumber: number;
	private _contentLeft: number;

	constructor(context: ViewContext) {
		super();
		this._context = context;
		this._lineHeight = this._context.configuration.editor.lineHeight;
		this._renderLineHighlight = this._context.configuration.editor.viewInfo.renderLineHighlight;

		this._primaryCursorIsInEditableRange = true;
		this._primaryCursorLineNumber = 1;
		this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;

		this._context.addEventHandler(this);
	}

	public dispose(): void {
		this._context.removeEventHandler(this);
		this._context = null;
	}

	// --- begin event handlers

	public onModelFlushed(e: viewEvents.ViewModelFlushedEvent): boolean {
		this._primaryCursorIsInEditableRange = true;
		this._primaryCursorLineNumber = 1;
		return true;
	}
	public onModelLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean {
		return true;
	}
	public onModelLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean {
		return true;
	}
	public onCursorPositionChanged(e: viewEvents.ViewCursorPositionChangedEvent): boolean {
		let hasChanged = false;
		if (this._primaryCursorIsInEditableRange !== e.isInEditableRange) {
			this._primaryCursorIsInEditableRange = e.isInEditableRange;
			hasChanged = true;
		}
		if (this._primaryCursorLineNumber !== e.position.lineNumber) {
			this._primaryCursorLineNumber = e.position.lineNumber;
			hasChanged = true;
		}
		return hasChanged;
	}
	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		if (e.lineHeight) {
			this._lineHeight = this._context.configuration.editor.lineHeight;
		}
		if (e.viewInfo.renderLineHighlight) {
			this._renderLineHighlight = this._context.configuration.editor.viewInfo.renderLineHighlight;
		}
		if (e.layoutInfo) {
			this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;
		}
		return true;
	}
	public onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean {
		return true;
	}
	// --- end event handlers

	public prepareRender(ctx: IRenderingContext): void {
	}

	public render(startLineNumber: number, lineNumber: number): string {
		if (lineNumber === this._primaryCursorLineNumber) {
			if (this._shouldShowCurrentLine()) {
				return (
					'<div class="current-line-margin" style="width:'
					+ String(this._contentLeft)
					+ 'px; height:'
					+ String(this._lineHeight)
					+ 'px;"></div>'
				);
			} else {
				return '';
			}
		}
		return '';
	}

	private _shouldShowCurrentLine(): boolean {
		return (this._renderLineHighlight === 'gutter' || this._renderLineHighlight === 'all') && this._primaryCursorIsInEditableRange;
	}
}
