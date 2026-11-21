#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::{Value, json};
use tao::dpi::{LogicalSize, PhysicalPosition, PhysicalSize};
use tao::event::{Event, WindowEvent};
use tao::event_loop::{ControlFlow, EventLoopBuilder};
use tao::window::{Icon, Window, WindowBuilder};
use wry::{WebContext, WebViewBuilder};


const FACE_W: f64 = 364.0;
const FACE_H: f64 = 757.0;
const MIN_SCALE: f64 = 0.45;
const MAX_SCALE: f64 = 1.40;

#[cfg(target_os = "windows")]
mod storage {
    use windows_sys::Win32::Foundation::ERROR_SUCCESS;
    use windows_sys::Win32::System::Registry::{
        HKEY, HKEY_CURRENT_USER, KEY_READ, KEY_SET_VALUE, REG_OPTION_NON_VOLATILE, REG_SZ,
        RegCloseKey, RegCreateKeyExW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
    };

    const SUBKEY: &str = "Software\\CASIO\\FX-991ES PLUS";

    fn wide(value: &str) -> Vec<u16> {
        value.encode_utf16().chain(Some(0)).collect()
    }

    fn open(create: bool) -> Option<HKEY> {
        let subkey = wide(SUBKEY);
        let mut handle: HKEY = std::ptr::null_mut();
        let status = if create {
            unsafe {
                RegCreateKeyExW(
                    HKEY_CURRENT_USER,
                    subkey.as_ptr(),
                    0,
                    std::ptr::null(),
                    REG_OPTION_NON_VOLATILE,
                    KEY_READ | KEY_SET_VALUE,
                    std::ptr::null(),
                    &mut handle,
                    std::ptr::null_mut(),
                )
            }
        } else {
            unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, subkey.as_ptr(), 0, KEY_READ, &mut handle) }
        };
        if status == ERROR_SUCCESS && !handle.is_null() {
            Some(handle)
        } else {
            None
        }
    }

    pub fn read(name: &str) -> Option<String> {
        let handle = open(false)?;
        let name = wide(name);
        let mut kind = 0u32;
        let mut size = 0u32;
        let status = unsafe {
            RegQueryValueExW(
                handle,
                name.as_ptr(),
                std::ptr::null(),
                &mut kind,
                std::ptr::null_mut(),
                &mut size,
            )
        };
        if status != ERROR_SUCCESS || kind != REG_SZ || size == 0 {
            unsafe { RegCloseKey(handle) };
            return None;
        }
        let mut buffer = vec![0u16; (size as usize + 1) / 2];
        let status = unsafe {
            RegQueryValueExW(
                handle,
                name.as_ptr(),
                std::ptr::null(),
                &mut kind,
                buffer.as_mut_ptr().cast::<u8>(),
                &mut size,
            )
        };
        unsafe { RegCloseKey(handle) };
        if status != ERROR_SUCCESS {
            return None;
        }
        let length = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
        Some(String::from_utf16_lossy(&buffer[..length]))
    }

    pub fn write(name: &str, value: &str) {
        let Some(handle) = open(true) else {
            return;
        };
        let name = wide(name);
        let value = wide(value);
        unsafe {
            RegSetValueExW(
                handle,
                name.as_ptr(),
                0,
                REG_SZ,
                value.as_ptr().cast::<u8>(),
                (value.len() * 2) as u32,
            );
            RegCloseKey(handle);
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod storage {
    pub fn read(_name: &str) -> Option<String> {
        None
    }

    pub fn write(_name: &str, _value: &str) {}
}

#[cfg(target_os = "windows")]
fn acquire_single_instance() -> bool {
    use windows_sys::Win32::Foundation::{GetLastError, ERROR_ALREADY_EXISTS};
    use windows_sys::Win32::System::Threading::CreateMutexW;

    let name: Vec<u16> = "Local\\CASIO_FX_991ES_PLUS_SingleInstance\0"
        .encode_utf16()
        .collect();
    let handle = unsafe { CreateMutexW(std::ptr::null(), 0, name.as_ptr()) };
    if handle.is_null() {
        return true;
    }
    if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
        focus_existing_window();
        return false;
    }
    true
}

#[cfg(target_os = "windows")]
fn focus_existing_window() {
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        FindWindowW, SetForegroundWindow, ShowWindow, SW_RESTORE,
    };

    let title: Vec<u16> = "CASIO fx-991ES PLUS\0".encode_utf16().collect();
    let hwnd = unsafe { FindWindowW(std::ptr::null(), title.as_ptr()) };
    if !hwnd.is_null() {
        unsafe {
            ShowWindow(hwnd, SW_RESTORE);
            SetForegroundWindow(hwnd);
        }
    }
}

#[derive(Debug)]
enum UserEvent {
    Ipc(String),
    Show,
}

fn ownership_preconfirmed() -> bool {
    cfg!(feature = "installed")
}

#[cfg(test)]
mod tests {
    use super::ownership_preconfirmed;

    #[test]
    fn ownership_preconfirmation_matches_build_feature() {
        assert_eq!(ownership_preconfirmed(), cfg!(feature = "installed"));
    }
}

fn main() -> wry::Result<()> {
    #[cfg(target_os = "windows")]
    if !acquire_single_instance() {
        return Ok(());
    }

    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let proxy = event_loop.create_proxy();

    #[cfg(feature = "installed")]
    let ownership_confirmed = ownership_preconfirmed();

    #[cfg(not(feature = "installed"))]
    let ownership_confirmed = ownership_preconfirmed()
        || storage::read("Ownership").as_deref() == Some("1");

    let settings = storage::read("Settings")
        .and_then(|s| serde_json::from_str::<Value>(&s).ok())
        .unwrap_or_else(|| json!({}));

    let mut builder = WindowBuilder::new()
        .with_title("CASIO fx-991ES PLUS")
        .with_inner_size(LogicalSize::new(FACE_W, FACE_H))
        .with_resizable(false)
        .with_maximizable(false)
        .with_decorations(false)
        .with_transparent(true)
        .with_visible(false);

    #[cfg(target_os = "windows")]
    {
        use tao::platform::windows::{IconExtWindows, WindowBuilderExtWindows};
        builder = builder.with_undecorated_shadow(false);
        let icon = Icon::from_resource(1, Some(PhysicalSize::new(256, 256)))
            .or_else(|_| Icon::from_resource(1, None));
        if let Ok(icon) = icon {
            builder = builder.with_window_icon(Some(icon.clone())).with_taskbar_icon(Some(icon));
        }
    }

    let window = builder.build(&event_loop).expect("create calculator window");

    #[cfg(target_os = "windows")]
    {
        use tao::platform::windows::WindowExtWindows;
        window.set_undecorated_shadow(false);
    }

    let saved_scale = settings
        .get("scale")
        .and_then(Value::as_f64)
        .unwrap_or(1.0)
        .clamp(MIN_SCALE, max_scale(&window));
    window.set_inner_size(LogicalSize::new(
        FACE_W * saved_scale,
        FACE_H * saved_scale,
    ));
    center_on_screen(&window);

    let state_script = format!(
        "window.__casioOwnershipConfirmed={ownership_confirmed}; window.__casioSettings={settings};"
    );

    let html = include_str!("../ui/index.html")
        .replace("/*__STATE__*/", &state_script)
        .replace("/*__STYLES__*/", include_str!("../ui/styles.css"))
        .replace("/*__BRIDGE__*/", include_str!("../ui/bridge.js"))
        .replace("/*__ENGINE__*/", include_str!("../ui/engine.js"))
        .replace("/*__APP__*/", include_str!("../ui/app.js"));

    
    let data_dir = std::env::temp_dir().join("CASIO-FX-991ES-PLUS-WebView2");
    let mut context = WebContext::new(Some(data_dir));
    let show_proxy = proxy.clone();

    let webview = WebViewBuilder::new_with_web_context(&mut context)
        .with_html(html)
        .with_transparent(true)
        .with_background_color((0, 0, 0, 0))
        .with_hotkeys_zoom(false)
        .with_devtools(cfg!(debug_assertions))
        .with_ipc_handler(move |request| {
            let body = request.body().to_string();
            if serde_json::from_str::<Value>(&body).is_ok() {
                let _ = proxy.send_event(UserEvent::Ipc(body));
            }
        })
        .build(&window)?;

    webview.zoom(1.0)?;

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(1500));
        let _ = show_proxy.send_event(UserEvent::Show);
    });

    let mut pinned = false;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,

            Event::UserEvent(UserEvent::Show) => window.set_visible(true),

            Event::UserEvent(UserEvent::Ipc(body)) => {
                let Ok(msg) = serde_json::from_str::<Value>(&body) else {
                    return;
                };
                let cmd = msg.get("cmd").and_then(Value::as_str).unwrap_or("");
                let id = msg.get("id").cloned().unwrap_or(Value::Null);

                match cmd {
                    "ready" => window.set_visible(true),
                    "drag" => {
                        let _ = window.drag_window();
                    }
                    "minimize" => window.set_minimized(true),
                    "close" => *control_flow = ControlFlow::Exit,
                    "pin" => {
                        pinned = !pinned;
                        window.set_always_on_top(pinned);
                        let js = format!(
                            "document.querySelector('.solar-btn.pin')?.classList.toggle('is-on', {});",
                            pinned
                        );
                        let _ = webview.evaluate_script(&js);
                    }
                    "fit" | "reset" => {
                        window.set_inner_size(LogicalSize::new(FACE_W, FACE_H));
                        center_on_screen(&window);
                    }
                    "getOwnership" => {
                        let confirmed = storage::read("Ownership").as_deref() == Some("1");
                        reply(&webview, &id, json!({ "confirmed": confirmed }));
                    }
                    "setOwnership" => {
                        storage::write("Ownership", "1");
                        reply(&webview, &id, json!({ "ok": true }));
                    }
                    "getSettings" => {
                        let settings = storage::read("Settings")
                            .and_then(|s| serde_json::from_str::<Value>(&s).ok())
                            .unwrap_or_else(|| json!({}));
                        reply(&webview, &id, json!({ "settings": settings }));
                    }
                    "setSettings" => {
                        let settings = msg.get("settings").cloned().unwrap_or_else(|| json!({}));
                        if let Ok(text) = serde_json::to_string(&settings) {
                            storage::write("Settings", &text);
                        }
                        reply(&webview, &id, json!({ "ok": true }));
                    }
                    "getLimits" => {
                        let max = max_scale(&window);
                        reply(&webview, &id, json!({ "min": MIN_SCALE, "max": max }));
                    }
                    "setScale" => {
                        let requested = msg.get("scale").and_then(Value::as_f64).unwrap_or(1.0);
                        let max = max_scale(&window);
                        let scale = requested.clamp(MIN_SCALE, max);
                        window.set_inner_size(LogicalSize::new(FACE_W * scale, FACE_H * scale));
                        center_on_screen(&window);
                        reply(&webview, &id, json!({ "scale": scale, "min": MIN_SCALE, "max": max }));
                    }
                    "log" => {
                        #[cfg(debug_assertions)]
                        println!("JSLOG {body}");
                    }
                    _ => {}
                }
            }

            _ => {}
        }
    });
}

fn reply(webview: &wry::WebView, id: &Value, payload: Value) {
    let mut value = payload;
    if let Some(obj) = value.as_object_mut() {
        obj.insert("id".to_string(), id.clone());
    }
    let script = format!("window.__ipcReply && window.__ipcReply({value});");
    let _ = webview.evaluate_script(&script);
}

#[cfg(target_os = "windows")]
fn work_area(window: &Window) -> Option<(i32, i32, i32, i32)> {
    use tao::platform::windows::WindowExtWindows;
    use windows_sys::Win32::Foundation::HWND;
    use windows_sys::Win32::Graphics::Gdi::{
        MONITOR_DEFAULTTONEAREST, MONITORINFO, MonitorFromWindow, GetMonitorInfoW,
    };

    let hwnd = window.hwnd() as HWND;
    let monitor = unsafe { MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST) };
    let mut info: MONITORINFO = unsafe { std::mem::zeroed() };
    info.cbSize = std::mem::size_of::<MONITORINFO>() as u32;
    if unsafe { GetMonitorInfoW(monitor, &mut info) } == 0 {
        return None;
    }
    let rect = info.rcWork;
    Some((
        rect.left,
        rect.top,
        (rect.right - rect.left).max(0),
        (rect.bottom - rect.top).max(0),
    ))
}

#[cfg(not(target_os = "windows"))]
fn work_area(_window: &Window) -> Option<(i32, i32, i32, i32)> {
    None
}

fn max_scale(window: &Window) -> f64 {
    if let Some(monitor) = window.current_monitor().or_else(|| window.primary_monitor()) {
        let factor = monitor.scale_factor().max(0.5);
        let (w, h) = match work_area(window) {
            Some((_, _, w, h)) => (w as f64 / factor, h as f64 / factor),
            None => (
                monitor.size().width as f64 / factor,
                monitor.size().height as f64 / factor,
            ),
        };
        return ((w - 16.0) / FACE_W)
            .min((h - 16.0) / FACE_H)
            .min(MAX_SCALE)
            .max(MIN_SCALE);
    }
    MAX_SCALE
}

fn center_on_screen(window: &Window) {
    if let Some((left, top, width, height)) = work_area(window) {
        let outer = window.outer_size();
        let x = left + ((width - outer.width as i32) / 2).max(0);
        let y = top + ((height - outer.height as i32) / 2).max(0);
        window.set_outer_position(PhysicalPosition::new(x, y));
        return;
    }
    if let Some(monitor) = window.current_monitor().or_else(|| window.primary_monitor()) {
        let size = monitor.size();
        let pos = monitor.position();
        let outer = window.outer_size();
        let x = pos.x + ((size.width as i32 - outer.width as i32) / 2).max(0);
        let y = pos.y + ((size.height as i32 - outer.height as i32) / 2).max(0);
        window.set_outer_position(PhysicalPosition::new(x, y));
    }
}